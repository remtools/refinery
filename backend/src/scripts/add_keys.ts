
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Inline Database class to avoid import issues
class Database {
    private db: sqlite3.Database;

    constructor(dbPath: string) {
        this.db = new sqlite3.Database(dbPath);
    }

    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('PRAGMA foreign_keys = ON');
                resolve();
            });
        });
    }

    async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) reject(err);
                else resolve(this);
            });
        });
    }

    async get<T>(sql: string, params: any[] = []): Promise<T | undefined> {
        const get = promisify(this.db.get.bind(this.db)) as (sql: string, params: any[]) => Promise<T | undefined>;
        return get(sql, params);
    }

    async all<T>(sql: string, params: any[] = []): Promise<T[]> {
        const all = promisify(this.db.all.bind(this.db)) as (sql: string, params: any[]) => Promise<T[]>;
        return all(sql, params);
    }

    async close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}

const dbPath = path.resolve(process.cwd(), 'requirements.db');
console.log('Opening DB at:', dbPath);
const db = new Database(dbPath);

async function addColumnIfNotExists(table: string, column: string) {
    try {
        await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} TEXT`);
        console.log(`Added column ${column} to ${table}`);
    } catch (e: any) {
        if (e.message && e.message.includes('duplicate column')) {
            console.log(`Column ${column} already exists in ${table}`);
        } else {
            // SQLite confusingly throws generic errors sometimes, but usually duplicate column is clear.
            // We can check explicitly before via table_info but this is faster.
            console.error(`Error adding column to ${table} (might already exist):`, e.message);
        }
    }
}

async function migrate() {
    await db.connect();

    // 1. Add columns
    await addColumnIfNotExists('stories', 'key');
    await addColumnIfNotExists('acceptance_criteria', 'key');
    await addColumnIfNotExists('test_cases', 'key');

    // 2. Backfill Stories
    const stories = await db.all<any>('SELECT id, key FROM stories WHERE key IS NULL OR key = ""');
    console.log(`Found ${stories.length} stories to backfill`);
    for (let i = 0; i < stories.length; i++) {
        const key = `STORY-${(i + 1).toString().padStart(3, '0')}`;
        await db.run('UPDATE stories SET key = ? WHERE id = ?', [key, stories[i].id]);
    }

    // 3. Backfill AC
    // Note: It's better to number them per story like STORY-1-AC-1, but simplest is AC-001 globally for now to match User Request format "AC-000".
    const acs = await db.all<any>('SELECT id, key FROM acceptance_criteria WHERE key IS NULL OR key = ""');
    console.log(`Found ${acs.length} ACs to backfill`);
    for (let i = 0; i < acs.length; i++) {
        const key = `AC-${(i + 1).toString().padStart(3, '0')}`;
        await db.run('UPDATE acceptance_criteria SET key = ? WHERE id = ?', [key, acs[i].id]);
    }

    // 4. Backfill TCs
    const tcs = await db.all<any>('SELECT id, key FROM test_cases WHERE key IS NULL OR key = ""');
    console.log(`Found ${tcs.length} TCs to backfill`);
    for (let i = 0; i < tcs.length; i++) {
        const key = `TC-${(i + 1).toString().padStart(3, '0')}`;
        await db.run('UPDATE test_cases SET key = ? WHERE id = ?', [key, tcs[i].id]);
    }

    console.log('Migration complete');
    await db.close();
}

migrate().catch(console.error);
