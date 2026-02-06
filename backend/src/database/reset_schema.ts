import { db } from './index.js';

const reset = async () => {
    try {
        await db.connect();
        console.log('Dropping all tables...');
        await db.run('PRAGMA foreign_keys = OFF');
        await db.run('DROP TABLE IF EXISTS test_runs');
        await db.run('DROP TABLE IF EXISTS test_sets');
        await db.run('DROP TABLE IF EXISTS test_cases');
        await db.run('DROP TABLE IF EXISTS acceptance_criteria');
        await db.run('DROP TABLE IF EXISTS stories');
        await db.run('DROP TABLE IF EXISTS epics');
        await db.run('DROP TABLE IF EXISTS actors');
        await db.run('DROP TABLE IF EXISTS projects');
        await db.run('DROP TABLE IF EXISTS statuses');
        console.log('Tables dropped.');
    } catch (error) {
        console.error('Reset failed:', error);
    } finally {
        await db.close();
    }
};

reset();
