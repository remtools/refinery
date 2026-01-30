import { db } from './index.js';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  console.log('Seeding database with sample data...');

  // Sample Epic
  const epicId = uuidv4();
  const now = new Date().toISOString();
  
  await db.run(`
    INSERT INTO epics (id, key, title, description, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    epicId,
    'EPIC-001',
    'User Authentication System',
    'Implement secure user authentication and authorization system with login, registration, and password management features.',
    'Draft',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Story
  const storyId = uuidv4();
  await db.run(`
    INSERT INTO stories (id, epic_id, actor, action, outcome, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    storyId,
    epicId,
    'registered user',
    'logs in with valid credentials',
    'is successfully authenticated and redirected to dashboard',
    'Draft',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Acceptance Criterion
  const acId = uuidv4();
  await db.run(`
    INSERT INTO acceptance_criteria (id, story_id, given, "when", "then", status, valid, risk, comments, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    acId,
    storyId,
    'I am a registered user with valid credentials',
    'I enter my username and password and click login',
    'I am authenticated successfully and redirected to my dashboard',
    'Draft',
    1,
    'Medium',
    '',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Test Case
  const testCaseId = uuidv4();
  await db.run(`
    INSERT INTO test_cases (id, acceptance_criterion_id, preconditions, steps, expected_result, priority, test_status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    testCaseId,
    acId,
    'User has valid account in system',
    '1. Navigate to login page\n2. Enter valid username\n3. Enter valid password\n4. Click login button',
    'User is redirected to dashboard with success message',
    'High',
    'Not Run',
    now,
    'system',
    now,
    'system'
  ]);

  console.log('Sample data seeded successfully!');
};

const main = async () => {
  try {
    await db.connect();
    await seedData();
    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
};

main();