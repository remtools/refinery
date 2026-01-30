import { db } from './index.js';

const createTables = async () => {
  console.log('Creating database tables...');

  // Projects table
  console.log('Creating projects table...');
  await db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Active', 'Archived', 'Planned')),
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL
    )
  `);

  // Epics table
  await db.run(`
    CREATE TABLE IF NOT EXISTS epics (
      id TEXT PRIMARY KEY,
      project_id TEXT,
      key TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Draft', 'Approved', 'Locked')),
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Ensure project_id column exists if table was already there
  try {
    const columns = await db.all('PRAGMA table_info(epics)');
    const hasProjectId = columns.some((col: any) => col.name === 'project_id');
    if (!hasProjectId) {
      console.log('Adding project_id column to epics table...');
      await db.run('ALTER TABLE epics ADD COLUMN project_id TEXT REFERENCES projects(id) ON DELETE SET NULL');
    }
  } catch (error) {
    console.error('Error checking/adding project_id to epics:', error);
  }

  // Stories table
  await db.run(`
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      epic_id TEXT NOT NULL,
      actor TEXT,
      actor_id TEXT,
      action TEXT NOT NULL,
      outcome TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Draft', 'Approved', 'Locked')),
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      FOREIGN KEY (epic_id) REFERENCES epics(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE SET NULL
    )
  `);

  try {
    const columns = await db.all<any>('PRAGMA table_info(stories)');
    const hasActorId = columns.some((col: any) => col.name === 'actor_id');
    if (!hasActorId) {
      console.log('Adding actor_id to stories...');
      await db.run('ALTER TABLE stories ADD COLUMN actor_id TEXT REFERENCES actors(id) ON DELETE SET NULL');

      console.log('Migrating story actors...');
      await db.run(`
              UPDATE stories 
              SET actor_id = (
                  SELECT actors.id 
                  FROM actors 
                  JOIN epics ON epics.project_id = actors.project_id 
                  WHERE epics.id = stories.epic_id AND actors.name = stories.actor
              )
              WHERE actor_id IS NULL AND actor IS NOT NULL
          `);
    }
  } catch (error) {
    console.error('Migration error for stories:', error);
  }

  // Acceptance Criteria table
  await db.run(`
    CREATE TABLE IF NOT EXISTS acceptance_criteria (
      id TEXT PRIMARY KEY,
      story_id TEXT NOT NULL,
      given TEXT NOT NULL,
      "when" TEXT NOT NULL,
      "then" TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('Draft', 'Approved', 'Locked')),
      valid INTEGER NOT NULL DEFAULT 1,
      risk TEXT NOT NULL CHECK (risk IN ('Low', 'Medium', 'High')),
      comments TEXT DEFAULT '',
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      FOREIGN KEY (story_id) REFERENCES stories(id) ON DELETE CASCADE
    )
  `);

  // Test Cases table
  await db.run(`
    CREATE TABLE IF NOT EXISTS test_cases (
      id TEXT PRIMARY KEY,
      acceptance_criterion_id TEXT NOT NULL,
      preconditions TEXT NOT NULL,
      steps TEXT NOT NULL,
      expected_result TEXT NOT NULL,
      priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High')),
      test_status TEXT NOT NULL CHECK (test_status IN ('Not Run', 'Pass', 'Fail', 'Blocked')),
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      FOREIGN KEY (acceptance_criterion_id) REFERENCES acceptance_criteria(id) ON DELETE CASCADE
    )
  `);

  // Actors table
  await db.run(`
    CREATE TABLE IF NOT EXISTS actors (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT,
      description TEXT,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  console.log('Tables created successfully!');
};

const main = async () => {
  try {
    await db.connect();
    await createTables();
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
};

main();