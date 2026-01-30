import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private db: sqlite3.Database;

  constructor(dbPath: string = './requirements.db') {
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
    const run = promisify(this.db.run.bind(this.db));
    return run(sql, params);
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

export const db = new Database();