
import { db } from './index.js';
import { EpicService } from '../models/Epic.js';
import { StoryService } from '../models/Story.js';
import { v4 as uuidv4 } from 'uuid';

const run = async () => {
    try {
        await db.connect();

        const epicService = new EpicService();
        const storyService = new StoryService();

        // Need to fetch a valid actor for the story creation part
        const actor = await db.get<any>('SELECT id FROM actors LIMIT 1');
        const project = await db.get<any>('SELECT id FROM projects LIMIT 1');

        if (!actor || !project) {
            console.error("Cannot run test: No actors/projects found in DB.");
            return;
        }

        console.log("--- Starting Epic Deletion Verification ---");

        // --- Test 1: Empty Epic ---
        const emptyEpic = await epicService.create({
            project_id: project.id,
            title: "Empty Deletable Epic",
            description: "Should be deleted",
            created_by: "tester",
            status: "Archived",
            key: "EMP-01"
        });
        console.log(`1. Created Empty Epic: ${emptyEpic.id}`);

        const deleteResult = await epicService.delete(emptyEpic.id);
        console.log(`   Delete Result: ${deleteResult}`);

        const check1 = await epicService.getById(emptyEpic.id);
        if (!check1) {
            console.log("   SUCCESS: Empty Epic deleted.");
        } else {
            console.error("   FAILURE: Empty Epic still exists.");
        }

        // --- Test 2: Epic with Story ---
        const parentEpic = await epicService.create({
            project_id: project.id,
            title: "Parent Epic",
            description: "Has children",
            created_by: "tester",
            status: "Archived",
            key: "PAR-01"
        });

        await storyService.create({
            epic_id: parentEpic.id,
            actor_id: actor.id,
            action: 'block',
            outcome: 'block',
            created_by: 'tester',
            status: 'Archived'
        });
        console.log(`2. Created Parent Epic with Story: ${parentEpic.id}`);

        try {
            await epicService.delete(parentEpic.id);
            console.log("   FAILURE: Parent Epic was deleted (Should be blocked)!");
        } catch (e) {
            console.log(`   SUCCESS: Deletion blocked as expected with error: "${e.message}"`);
        }

    } catch (e) {
        console.error("Test Script Error:", e);
    } finally {
        await db.close();
    }
}

run();
