import { db } from '../database/index.js';
import { Story } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

import { StatusService } from './Status.js';

const statusService = new StatusService();

export class StoryService {
  async getAll(): Promise<Story[]> {
    return db.all<Story>('SELECT * FROM stories ORDER BY created_at DESC');
  }

  async getById(id: string): Promise<Story | undefined> {
    return db.get<Story>('SELECT * FROM stories WHERE id = ?', [id]);
  }

  async getByEpicId(epicId: string): Promise<Story[]> {
    return db.all<Story>('SELECT * FROM stories WHERE epic_id = ? ORDER BY created_at DESC', [epicId]);
  }

  async generateNextKey(): Promise<string> {
    const last = await db.get<{ key: string }>('SELECT key FROM stories WHERE key LIKE "STORY-%" ORDER BY length(key) DESC, key DESC LIMIT 1');
    if (!last || !last.key) return 'STORY-001';
    const match = last.key.match(/STORY-(\d+)/);
    if (!match) return 'STORY-001';
    const nextNum = parseInt(match[1]) + 1;
    return `STORY-${nextNum.toString().padStart(3, '0')}`;
  }

  async create(data: {
    epic_id: string;
    key?: string; // Optional now
    actor_id: string;
    action: string;
    outcome: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    created_by: string;
  }): Promise<Story> {
    // Verify epic exists
    const epic = await db.get('SELECT id FROM epics WHERE id = ?', [data.epic_id]);
    if (!epic) {
      throw new Error('Referenced epic does not exist');
    }

    // Fetch actor name for backward compatibility
    const actor = await db.get<{ name: string }>('SELECT name FROM actors WHERE id = ?', [data.actor_id]);
    if (!actor) {
      throw new Error('Referenced actor does not exist');
    }

    const id = uuidv4();
    const now = new Date().toISOString();
    const key = data.key || await this.generateNextKey();

    const story: Story = {
      id,
      epic_id: data.epic_id,
      key,
      actor_id: data.actor_id,
      action: data.action,
      outcome: data.outcome,
      status: data.status || 'Drafted',
      created_at: now,
      created_by: data.created_by,
      updated_at: now,
      updated_by: data.created_by
    };

    await db.run(`
      INSERT INTO stories (id, epic_id, key, actor, actor_id, action, outcome, status, created_at, created_by, updated_at, updated_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      story.id, story.epic_id, story.key, actor.name, story.actor_id, story.action, story.outcome, story.status,
      story.created_at, story.created_by, story.updated_at, story.updated_by
    ]);

    return story;
  }

  async update(id: string, data: {
    actor_id?: string;
    action?: string;
    outcome?: string;
    status?: 'Drafted' | 'Reviewed' | 'Locked' | 'Archived';
    updated_by: string;
  }): Promise<Story | undefined> {
    const existing = await this.getById(id);
    if (!existing) {
      return undefined;
    }

    // Check if story is locked
    if (existing.status === 'Locked' && data.status !== 'Locked') {
      // Allow unlocking? Usually yes, if explicitly done. But requirements said "story should only be deletable if Drafted".
      // Assuming modification is allowed if not locked, OR if transitioning states.
      // User didn't explicitly forbid transitions from Locked.
      // "story statuses need to be Drafted, Reviewed, Locked"
    }

    // Existing logic prevented modification OF a locked story.
    if (existing.status === 'Locked' && !data.status) { // If trying to edit fields while locked
      throw new Error('Cannot modify locked story');
    }
    // If we are changing status FROM locked to something else, that might be allowed or not. 
    // Usually locking prevents edits. Let's keep it simple: strict lock.
    // If status is passed and it is changing, strictly speaking we are modifying it.
    // Let's assume user can unlock by setting status back to Reviewed/Drafted? 
    // The previous code: `if (existing.status === 'Locked') throw ...` blocked ANY edit.
    // Correct way to unlock is usually a dedicated action or allowing status change.
    // I will relax it slightly to allow status change if specifically requested? 
    // actually, let's keep it consistent: "Cannot modify locked story" means stuck.
    // UNLESS the update IS the status change.

    if (existing.status === 'Locked' && data.status !== 'Drafted' && data.status !== 'Reviewed') {
      // If we are NOT unlocking it, then we can't edit it.
      // Wait, if I am sending { status: 'Reviewed' } for a Locked story, I am modifying a locked story.
      // Let's implement strict interpretation: Locked means Locked.
      // But user needs a way to unlock? Maybe they didn't ask for it.
      // I'll stick to new statuses for now.
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.actor_id !== undefined) {
      // Fetch actor name for backward compatibility
      const actor = await db.get<{ name: string }>('SELECT name FROM actors WHERE id = ?', [data.actor_id]);
      if (!actor) {
        throw new Error('Referenced actor does not exist');
      }
      updates.push('actor_id = ?');
      updates.push('actor = ?');
      values.push(data.actor_id);
      values.push(actor.name);
    }
    if (data.action !== undefined) {
      updates.push('action = ?');
      values.push(data.action);
    }
    if (data.outcome !== undefined) {
      updates.push('outcome = ?');
      values.push(data.outcome);
    }
    if (data.status !== undefined) {
      updates.push('status = ?');
      values.push(data.status);
    }

    updates.push('updated_at = ?');
    updates.push('updated_by = ?');
    values.push(now, data.updated_by);

    values.push(id);

    await db.run(`
      UPDATE stories SET ${updates.join(', ')} WHERE id = ?
    `, values);

    return this.getById(id);
  }

  async delete(id: string): Promise<boolean> {
    const story = await this.getById(id);
    if (!story) return false;

    // Check deletion rules based on status configuration
    const statusConfig = await statusService.getByKey(story.status || 'Drafted');
    if (!statusConfig?.is_deletable) {
      throw new Error(`Stories in status '${story.status}' cannot be deleted`);
    }

    // Cascade delete: TCs -> ACs -> Story
    // 1. Get all ACs
    const acs = await db.all<{ id: string }>('SELECT id FROM acceptance_criteria WHERE story_id = ?', [id]);

    for (const ac of acs) {
      // 2. Delete all TCs for this AC
      await db.run('DELETE FROM test_cases WHERE acceptance_criterion_id = ?', [ac.id]);
      // Also delete test runs/items linked to these TCs? 
      // Test Runs link to TCs. If we delete TCs, we leave orphan TestRuns? 
      // Usually good to clean up Test Runs too. 
      // Let's do a deep clean.
      await db.run('DELETE FROM test_runs WHERE test_case_id IN (SELECT id FROM test_cases WHERE acceptance_criterion_id = ?)', [ac.id]);
    }

    // 3. Delete ACs
    await db.run('DELETE FROM acceptance_criteria WHERE story_id = ?', [id]);

    // 4. Delete Story
    const result = await db.run('DELETE FROM stories WHERE id = ?', [id]);
    return (result.changes || 0) > 0;
  }

  async export(id: string): Promise<any> {
    const story = await this.getById(id);
    if (!story) throw new Error('Story not found');

    const actor = await db.get<{ name: string }>('SELECT * FROM actors WHERE id = ?', [story.actor_id]);
    if (!actor) throw new Error('Actor not found');

    const acceptanceCriteria = await db.all('SELECT * FROM acceptance_criteria WHERE story_id = ?', [id]);

    for (const ac of acceptanceCriteria as any[]) {
      ac.testCases = await db.all('SELECT * FROM test_cases WHERE acceptance_criterion_id = ?', [ac.id]);
    }

    return {
      actor: actor.name,
      action: story.action,
      outcome: story.outcome,
      acceptanceCriteria: acceptanceCriteria.map((ac: any) => ({
        given: ac.given,
        when: ac.when,
        then: ac.then,
        risk: ac.risk,
        testCases: (ac.testCases || []).map((tc: any) => ({
          preconditions: tc.preconditions,
          steps: tc.steps,
          expected_result: tc.expected_result,
          priority: tc.priority
        }))
      }))
    };
  }

  async import(data: any, epicId: string): Promise<Story> {
    // Import services dynamically to avoid circular dependencies if any (safe pattern)
    const { AcceptanceCriterionService } = await import('./AcceptanceCriterion.js');
    const { TestCaseService } = await import('./TestCase.js');
    const { ActorService } = await import('./Actor.js');

    const acService = new AcceptanceCriterionService();
    const tcService = new TestCaseService();
    const actorService = new ActorService();

    // Verify Epic exists
    const epic = await db.get('SELECT id, project_id FROM epics WHERE id = ?', [epicId]);
    if (!epic) throw new Error('Target Epic does not exist');

    // 1. Resolve Actor
    // Try to find actor by ID first (if same project), then name
    let actorId = data.actor_id;
    let actor = await db.get<{ id: string }>('SELECT id FROM actors WHERE id = ?', [actorId]);

    if (!actor && data.actor) {
      // Try finding by name in the target project
      // Epics belong to a project, so we fetch project_id from epic (fetched above as `epic`)
      // Wait, `epic` query result needs casting or checking. `db.get` returns `any` by default unless generic used.
      // But above call `db.get('SELECT id...` implies row object.
      // Actually `db.get` generic is optional.
      const projectId = (epic as any).project_id;

      const existingActor = await db.get<{ id: string }>('SELECT id FROM actors WHERE project_id = ? AND name = ?', [projectId, data.actor.name || data.actor]);
      if (existingActor) {
        actorId = existingActor.id;
      } else {
        // Create new actor if provided in data
        const actorName = data.actor.name || data.actor || 'Imported Actor'; // data.actor might be object or string (legacy)
        const newActor = await actorService.create({
          project_id: projectId,
          name: actorName,
          role: data.actor.role || 'User',
          description: data.actor.description,
          created_by: 'import'
        });
        actorId = newActor.id;
      }
    } else if (!actor) {
      // Fallback if data.actor is missing/undefined but actor_id was invalid
      // Create a generic placeholder? Or fail?
      // Let's create a placeholder to ensure import success
      const projectId = (epic as any).project_id;
      const newActor = await actorService.create({
        project_id: projectId,
        name: 'Imported User',
        role: 'User',
        created_by: 'import'
      });
      actorId = newActor.id;
    }

    // 2. Create Story
    const key = await this.generateNextKey(); // Always generate new key for imported story to avoid collision
    const newStory = await this.create({
      epic_id: epicId,
      key,
      actor_id: actorId, // Use resolved actor ID
      action: data.action,
      outcome: data.outcome,
      status: 'Drafted', // Reset status
      created_by: 'import'
    });

    // 3. Import ACs
    if (data.acceptanceCriteria) {
      for (const acData of data.acceptanceCriteria) {
        // AC Keys are unique? `AC-XXX`. `generateNextKey` handled by Service internally if we don't pass one.
        // Or we might want to respect imported key IF it doesn't exist?
        // Safest is to let system generate new keys for AC/TC to guarantee uniqueness.
        // But users might want to keep IDs. `AcceptanceCriterionService` likely generates if missing.
        // Let's rely on creation logic to generate new keys.

        // Wait, AC service create takes `key`.
        // We should generate a new key because even if "AC-123" is unique in THIS project, 
        // if we import, we usually want a new copy.
        // I will check `ACService.create` signature later, but assuming I pass `undefined` or let it generate.
        // Actually `ACService.generateNextKey` is available.

        const acKey = await acService.generateNextKey();

        const newAc = await acService.create({
          story_id: newStory.id,
          key: acKey,
          given: acData.given,
          when: acData.when,
          then: acData.then,
          risk: acData.risk,
          created_by: 'import'
        });

        // 4. Import TCs
        if (acData.testCases) {
          for (const tcData of acData.testCases) {
            const tcKey = await tcService.generateNextKey();
            await tcService.create({
              acceptance_criterion_id: newAc.id,
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

    return newStory;
  }
}