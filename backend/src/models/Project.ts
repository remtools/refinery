import { db } from '../database/index.js';
import { Project } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export class ProjectService {
    async getAll(): Promise<Project[]> {
        return db.all<Project>('SELECT * FROM projects ORDER BY created_at DESC');
    }

    async getById(id: string): Promise<Project | undefined> {
        return db.get<Project>('SELECT * FROM projects WHERE id = ?', [id]);
    }

    async create(data: Partial<Project>): Promise<Project> {
        const id = uuidv4();
        const now = new Date().toISOString();
        const project: Project = {
            id,
            name: data.name || '',
            description: data.description || '',
            status: data.status || 'Planned',
            created_at: now,
            created_by: data.created_by || 'system',
            updated_at: now,
            updated_by: data.updated_by || 'system',
        };

        await db.run(
            `INSERT INTO projects (id, name, description, status, created_at, created_by, updated_at, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [project.id, project.name, project.description, project.status, project.created_at, project.created_by, project.updated_at, project.updated_by]
        );

        return project;
    }

    async update(id: string, data: Partial<Project>): Promise<Project | undefined> {
        const existing = await this.getById(id);
        if (!existing) return undefined;

        const now = new Date().toISOString();
        const updated = {
            ...existing,
            ...data,
            updated_at: now,
        };

        await db.run(
            `UPDATE projects SET name = ?, description = ?, status = ?, updated_at = ?, updated_by = ? WHERE id = ?`,
            [updated.name, updated.description, updated.status, updated.updated_at, updated.updated_by, id]
        );

        return updated;
    }

    async delete(id: string): Promise<boolean> {
        // Check if project has epics
        const epics = await db.all('SELECT id FROM epics WHERE project_id = ?', [id]);
        if (epics.length > 0) {
            throw new Error('Cannot delete project with existing epics');
        }

        const result = await db.run('DELETE FROM projects WHERE id = ?', [id]);
        return result.changes > 0;
    }

    async export(id: string): Promise<any> {
        const project = await this.getById(id);
        if (!project) throw new Error('Project not found');

        // Helper to get nested data
        const getEpics = async (projectId: string) => db.all<any>('SELECT * FROM epics WHERE project_id = ?', [projectId]);
        const getStories = async (epicId: string) => db.all<any>('SELECT * FROM stories WHERE epic_id = ?', [epicId]);
        const getACs = async (storyId: string) => db.all<any>('SELECT * FROM acceptance_criteria WHERE story_id = ?', [storyId]);
        const getTCs = async (acId: string) => db.all<any>('SELECT * FROM test_cases WHERE acceptance_criterion_id = ?', [acId]);
        const getActors = async (projectId: string) => db.all<any>('SELECT * FROM actors WHERE project_id = ?', [projectId]);

        // Get Test Sets linked to this project via Test Cases
        const getRelatedTestSets = async (projectId: string) => {
            return db.all<any>(`
                SELECT DISTINCT ts.* 
                FROM test_sets ts
                JOIN test_runs tr ON tr.test_set_id = ts.id
                JOIN test_cases tc ON tc.id = tr.test_case_id
                JOIN acceptance_criteria ac ON ac.id = tc.acceptance_criterion_id
                JOIN stories s ON s.id = ac.story_id
                JOIN epics e ON e.id = s.epic_id
                WHERE e.project_id = ?
            `, [projectId]);
        };
        const getTestRuns = async (testSetId: string) => db.all<any>('SELECT * FROM test_runs WHERE test_set_id = ?', [testSetId]);

        const epics = await getEpics(id);
        const actors = await getActors(id);
        const testSets = await getRelatedTestSets(id);

        for (const epic of epics) {
            epic.stories = await getStories(epic.id);
            for (const story of epic.stories) {
                story.acceptanceCriteria = await getACs(story.id);
                for (const ac of story.acceptanceCriteria) {
                    ac.testCases = await getTCs(ac.id);
                }
            }
        }

        // Populate Test Runs for Test Sets
        for (const ts of testSets) {
            ts.testRuns = await getTestRuns(ts.id);
        }

        return {
            ...project,
            actors,
            epics,
            testSets
        };
    }

    async import(data: any): Promise<Project> {
        // Services
        const { EpicService } = await import('./Epic.js');
        const { StoryService } = await import('./Story.js');
        const { AcceptanceCriterionService } = await import('./AcceptanceCriterion.js');
        const { TestCaseService } = await import('./TestCase.js');
        const { ActorService } = await import('./Actor.js');
        const { TestSetService } = await import('./TestSet.js');
        const { TestRunService } = await import('./TestRun.js');

        const epicService = new EpicService();
        const storyService = new StoryService();
        const acService = new AcceptanceCriterionService();
        const tcService = new TestCaseService();
        const actorService = new ActorService();
        const testSetService = new TestSetService();
        const testRunService = new TestRunService();

        // Check for existing key and generate new one if needed
        const getSafeKey = async (currentKey: string, table: string, service: any) => {
            const exists = await db.get(`SELECT id FROM ${table} WHERE key = ?`, [currentKey]);
            if (exists) {
                return await service.generateNextKey();
            }
            return currentKey;
        };

        const id = uuidv4();
        const now = new Date().toISOString();

        // 1. Create Project
        const newProject: Project = {
            id,
            name: `${data.name} (Imported)`,
            description: data.description || '',
            status: data.status || 'Planned',
            created_at: now,
            created_by: 'import',
            updated_at: now,
            updated_by: 'import',
        };

        await db.run(
            `INSERT INTO projects (id, name, description, status, created_at, created_by, updated_at, updated_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [newProject.id, newProject.name, newProject.description, newProject.status, newProject.created_at, newProject.created_by, newProject.updated_at, newProject.updated_by]
        );

        // 2. Import Actors
        const actorIdMap = new Map<string, string>();
        const actorNameMap = new Map<string, string>();

        if (data.actors) {
            for (const actorData of data.actors) {
                const newActor = await actorService.create({
                    project_id: newProject.id,
                    name: actorData.name,
                    role: actorData.role,
                    description: actorData.description,
                    created_by: 'import'
                });
                actorIdMap.set(actorData.id, newActor.id);
                actorNameMap.set(actorData.name, newActor.id);
            }
        }

        const tcIdMap = new Map<string, string>();

        // 3. Import Epics
        if (data.epics) {
            for (const epicData of data.epics) {
                const epicKey = await getSafeKey(epicData.key, 'epics', epicService);
                const epic = await epicService.create({
                    project_id: newProject.id,
                    key: epicKey,
                    title: epicData.title,
                    description: epicData.description,
                    created_by: 'import'
                });

                // 3. Import Stories
                if (epicData.stories) {
                    for (const storyData of epicData.stories) {
                        const storyKey = await getSafeKey(storyData.key, 'stories', storyService);

                        let actorId = storyData.actor_id ? actorIdMap.get(storyData.actor_id) : undefined;
                        if (!actorId && storyData.actor) {
                            actorId = actorNameMap.get(storyData.actor);
                        }

                        if (!actorId) {
                            // Fallback: create actor on the fly
                            const actorName = storyData.actor || storyData.actor_id || 'Unknown Actor';
                            let existingMapId = actorNameMap.get(actorName);

                            if (existingMapId) {
                                actorId = existingMapId;
                            } else {
                                const newActor = await actorService.create({
                                    project_id: newProject.id,
                                    name: actorName,
                                    created_by: 'import'
                                });
                                actorId = newActor.id;
                                actorNameMap.set(actorName, actorId);
                            }
                        }

                        const story = await storyService.create({
                            epic_id: epic.id,
                            key: storyKey,
                            actor_id: actorId!,
                            action: storyData.action,
                            outcome: storyData.outcome,
                            created_by: 'import'
                        });

                        // 4. Import ACs
                        if (storyData.acceptanceCriteria) {
                            for (const acData of storyData.acceptanceCriteria) {
                                const acKey = await getSafeKey(acData.key, 'acceptance_criteria', acService);
                                const ac = await acService.create({
                                    story_id: story.id,
                                    key: acKey,
                                    given: acData.given,
                                    when: acData.when,
                                    then: acData.then,
                                    risk: acData.risk,
                                    created_by: 'import'
                                });

                                // 5. Import Test Cases
                                if (acData.testCases) {
                                    for (const tcData of acData.testCases) {
                                        const tcKey = await getSafeKey(tcData.key, 'test_cases', tcService);
                                        const newTc = await tcService.create({
                                            acceptance_criterion_id: ac.id,
                                            key: tcKey,
                                            preconditions: tcData.preconditions,
                                            steps: tcData.steps,
                                            expected_result: tcData.expected_result,
                                            priority: tcData.priority,
                                            created_by: 'import'
                                        });
                                        // Store mapping for Test Run import
                                        if (tcData.id) {
                                            tcIdMap.set(tcData.id, newTc.id);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 6. Import Test Sets (and Runs)
        if (data.testSets) {
            for (const tsData of data.testSets) {
                // Test Sets are global, but good to check key collision
                const tsKey = await getSafeKey(tsData.key, 'test_sets', testSetService);

                const newTestSet = await testSetService.create({
                    title: `${tsData.title} (Imported)`,
                    description: tsData.description,
                    status: 'Planned', // Reset status or keep? 'Planned' is safer.
                    created_by: 'import'
                });

                // Need to update key manually to match if we want, but create() generates one. 
                // We should respect the generated key or update it if we really cared, but generated is fine.

                if (tsData.testRuns) {
                    for (const runData of tsData.testRuns) {
                        const newTcId = tcIdMap.get(runData.test_case_id);
                        if (newTcId) {
                            // Link to new test case
                            // Note: TestRunService often doesn't have a 'create' that takes exact fields, 
                            // usually creation is via TestSet bulk or specific logic.
                            // But we can insert directly via DB or use service if available.
                            // Let's assume TestRunService has basic create or we use db directly for flexibility?
                            // Checked TestRun.ts? No, but TestSetsView used `createBulkTestRuns`.
                            // Let's use db directly for speed and precision here or assume service method.

                            // Using db.run is safest given we don't know TestRunService full API right now 
                            // and TestRun usually depends on existing IDs.

                            const runId = uuidv4();
                            const runNow = new Date().toISOString();
                            await db.run(`
                                INSERT INTO test_runs (id, test_set_id, test_case_id, status, actual_result, executed_by, executed_at, notes)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            `, [
                                runId,
                                newTestSet.id,
                                newTcId,
                                'Not Run', // Reset status for imported runs
                                '',
                                undefined,
                                undefined,
                                ''
                            ]);
                        }
                    }
                }
            }
        }

        return newProject;
    }
}
