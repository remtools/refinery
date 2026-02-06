import { ProjectService } from '../models/Project.js';
import { db } from './index.js';
import { v4 as uuidv4 } from 'uuid';

const testUpdate = async () => {
    try {
        await db.connect();
        const projectService = new ProjectService();

        // 1. Create a project
        const project = await projectService.create({
            name: 'Test Project',
            description: 'Original Description',
            status: 'Planned',
            created_by: 'tester'
        });
        console.log('Created project:', project.id, project.name, project.status);

        // 2. Update the project
        const updated = await projectService.update(project.id, {
            name: 'Updated Project Name',
            description: 'Updated Description',
            status: 'Active',
            updated_by: 'tester'
        });
        console.log('Update result:', updated?.name, updated?.status);

        // 3. Verify persistence
        const fetched = await projectService.getById(project.id);
        console.log('Fetched project:', fetched?.name, fetched?.status);

        if (fetched?.name === 'Updated Project Name' && fetched?.status === 'Active') {
            console.log('SUCCESS: Project update persisted correctly.');
        } else {
            console.error('FAILURE: Project update did NOT persist.');
        }

        // Cleanup
        await projectService.delete(project.id);

    } catch (error) {
        console.error('Test failed:', error);
    } finally {
        await db.close();
    }
};

testUpdate();
