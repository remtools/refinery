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

        const epics = await getEpics(id);
        const actors = await getActors(id);

        for (const epic of epics) {
            epic.stories = await getStories(epic.id);
            for (const story of epic.stories) {
                story.acceptanceCriteria = await getACs(story.id);
                for (const ac of story.acceptanceCriteria) {
                    ac.testCases = await getTCs(ac.id);
                }
            }
        }

        return {
            ...project,
            actors,
            epics
        };
    }

    async import(data: any): Promise<Project> {
        // Services
        const { EpicService } = await import('./Epic.js');
        const { StoryService } = await import('./Story.js');
        const { AcceptanceCriterionService } = await import('./AcceptanceCriterion.js');
        const { TestCaseService } = await import('./TestCase.js');
        const { ActorService } = await import('./Actor.js');

        const epicService = new EpicService();
        const storyService = new StoryService();
        const acService = new AcceptanceCriterionService();
        const tcService = new TestCaseService();
        const actorService = new ActorService();

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

                        // If actor still not found (e.g. data corruption or legacy partial data), create a fallback actor?
                        // Or skip? Validation requires actor_id.
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
                                        await tcService.create({
                                            acceptance_criterion_id: ac.id,
                                            key: tcKey,
                                            preconditions: tcData.preconditions,
                                            steps: tcData.steps,
                                            expected_result: tcData.expected_result,
                                            priority: tcData.priority,
                                            created_by: 'import'
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return newProject;
    }
}
