
import { db } from './index.js';
import { StoryService } from '../models/Story.js';
import { StatusService } from '../models/Status.js';

const main = async () => {
    try {
        await db.connect();
        const storyService = new StoryService();
        const statusService = new StatusService();

        // 1. Create a dummy story with 'Archived' status (since only Archived is deletable now)
        const story = await storyService.create({
            epic_id: 'dummy_epic_id', // This might fail if FK constraint exists on epics... 
            // We need a valid epic ID. Let's list epics first.
            actor_id: 'dummy_actor', // This also might fail
            action: 'test delete',
            outcome: 'should be deleted',
            created_by: 'tester',
            status: 'Archived'
        });

        console.log('Created story:', story.id);

        // Wait, creating might fail if epic/actor don't exist due to FKs. 
        // Let's grab the first available epic and actor.
    } catch (e) {
        console.log("Initial create failed (likely FKs), retrying with valid data...");
    }
};

const realTest = async () => {
    await db.connect();
    const storyService = new StoryService();

    // Get valid FKs
    const epic = await db.get<any>('SELECT id FROM epics LIMIT 1');
    const actor = await db.get<any>('SELECT id FROM actors LIMIT 1');

    if (!epic || !actor) {
        console.error("No epics or actors found to test with.");
        return;
    }

    console.log("Using Epic:", epic.id);
    console.log("Using Actor:", actor.id);

    // Create Story
    const story = await storyService.create({
        epic_id: epic.id,
        actor_id: actor.id,
        action: 'test persistence',
        outcome: 'will be deleted',
        created_by: 'tester',
        status: 'Archived'
    });

    console.log(`1. Created Story: ${story.id} with status ${story.status}`);

    // Perform Delete
    console.log("2. Attempting Delete...");
    const result = await storyService.delete(story.id);
    console.log("3. Delete returned:", result);

    // Verify
    const check = await storyService.getById(story.id);
    console.log("4. Fetch after delete:", check);

    if (!check) {
        console.log("SUCCESS: Story is gone.");
    } else {
        console.error("FAILURE: Story still exists!");
    }

    await db.close();
}

realTest().catch(console.error);
