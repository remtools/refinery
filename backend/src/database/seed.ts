import { db } from './index.js';
import { v4 as uuidv4 } from 'uuid';

const seedData = async () => {
  console.log('Seeding database with sample data...');

  const now = new Date().toISOString();

  console.log('Clearing existing data...');
  await db.run('DELETE FROM test_cases');
  await db.run('DELETE FROM acceptance_criteria');
  await db.run('DELETE FROM stories');
  await db.run('DELETE FROM epics');
  await db.run('DELETE FROM actors');
  await db.run('DELETE FROM projects');

  // Statuses
  console.log('Inserting Statuses...');
  const statuses = [
    { key: 'Drafted', label: 'Drafted', entity_type: 'Global', color: 'bg-gray-100 text-gray-800', is_deletable: 1, is_archived: 0, is_default: 1, rank: 1 },
    { key: 'Reviewed', label: 'Reviewed', entity_type: 'Global', color: 'bg-green-100 text-green-800', is_deletable: 0, is_archived: 0, is_default: 0, rank: 2 },
    { key: 'Locked', label: 'Locked', entity_type: 'Global', color: 'bg-red-100 text-red-800', is_deletable: 0, is_archived: 0, is_default: 0, rank: 3 },
    { key: 'Archived', label: 'Archived', entity_type: 'Global', color: 'bg-yellow-100 text-yellow-800', is_deletable: 0, is_archived: 0, is_default: 0, rank: 4 }
  ];

  for (const s of statuses) {
    await db.run('INSERT INTO statuses (key, label, entity_type, color, is_deletable, is_archived, is_default, rank) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [s.key, s.label, s.entity_type, s.color, s.is_deletable, s.is_archived, s.is_default, s.rank]);
  }

  // Sample Project
  const projectId = uuidv4();
  console.log('Inserting Project...');
  await db.run(`
    INSERT INTO projects (id, name, description, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    projectId,
    'E-Commerce Platform',
    'A modern e-commerce solution with advanced cart and checkout features.',
    'Active',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Actors
  const adminActorId = uuidv4();
  const customerActorId = uuidv4();
  const guestActorId = uuidv4();
  console.log('Inserting Actors...');

  await db.run(`
    INSERT INTO actors (id, project_id, name, role, description, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    adminActorId,
    projectId,
    'Admin User',
    'Administrator',
    'Has full access to the system backend.',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO actors (id, project_id, name, role, description, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    customerActorId,
    projectId,
    'Registered Customer',
    'Customer',
    'A user who has created an account and can make purchases.',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO actors (id, project_id, name, role, description, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    guestActorId,
    projectId,
    'Guest User',
    'Visitor',
    'An unauthenticated visitor browsing the site.',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Epics
  const authEpicId = uuidv4();
  const cartEpicId = uuidv4();
  console.log('Inserting Epics...');

  await db.run(`
    INSERT INTO epics (id, project_id, key, title, description, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    authEpicId,
    projectId,
    'EPIC-001',
    'User Authentication System',
    'Implement secure user authentication and authorization system with login, registration, and password management features.',
    'Drafted',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO epics (id, project_id, key, title, description, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cartEpicId,
    projectId,
    'EPIC-002',
    'Shopping Cart Management',
    'Enable users to add, remove, and manage items in their shopping cart.',
    'Drafted',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Stories
  const loginStoryId = uuidv4();
  const registerStoryId = uuidv4();
  const addToCartStoryId = uuidv4();
  console.log('Inserting Stories...');

  await db.run(`
    INSERT INTO stories (id, epic_id, key, actor, actor_id, action, outcome, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    loginStoryId,
    authEpicId,
    'STORY-001',
    'Registered Customer', // Legacy field for backward compatibility
    customerActorId,
    'log in with valid credentials',
    'be successfully authenticated and redirected to dashboard',
    'Drafted',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO stories (id, epic_id, key, actor, actor_id, action, outcome, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    registerStoryId,
    authEpicId,
    'STORY-002',
    'Guest User',
    guestActorId,
    'register for a new account',
    'create an account and receive a confirmation email',
    'Drafted',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO stories (id, epic_id, key, actor, actor_id, action, outcome, status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    addToCartStoryId,
    cartEpicId,
    'STORY-003',
    'Registered Customer',
    customerActorId,
    'add items to my shopping cart',
    'save items for later purchase',
    'Drafted',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Acceptance Criteria
  const loginAcId = uuidv4();
  const registerAcId = uuidv4();
  console.log('Inserting Acceptance Criteria...');

  await db.run(`
    INSERT INTO acceptance_criteria (id, story_id, key, given, "when", "then", status, valid, risk, comments, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    loginAcId,
    loginStoryId,
    'AC-001',
    'I am a registered user with valid credentials',
    'I enter my username and password and click login',
    'I am authenticated successfully and redirected to my dashboard',
    'Drafted',
    1,
    'Medium',
    '',
    now,
    'system',
    now,
    'system'
  ]);

  await db.run(`
    INSERT INTO acceptance_criteria (id, story_id, key, given, "when", "then", status, valid, risk, comments, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    registerAcId,
    registerStoryId,
    'AC-002',
    'I am a guest user on the registration page',
    'I fill in all required fields and submit the form',
    'my account is created and I receive a confirmation email',
    'Drafted',
    1,
    'High',
    'Email verification is critical for security',
    now,
    'system',
    now,
    'system'
  ]);

  // Sample Test Cases
  const loginTcId = uuidv4();
  const registerTcId = uuidv4();
  console.log('Inserting Test Cases...');

  await db.run(`
    INSERT INTO test_cases (id, acceptance_criterion_id, key, preconditions, steps, expected_result, priority, test_status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    loginTcId,
    loginAcId,
    'TC-001',
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

  await db.run(`
    INSERT INTO test_cases (id, acceptance_criterion_id, key, preconditions, steps, expected_result, priority, test_status, created_at, created_by, updated_at, updated_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    registerTcId,
    registerAcId,
    'TC-002',
    'User is on registration page and email service is available',
    '1. Navigate to registration page\n2. Enter valid email address\n3. Enter strong password\n4. Confirm password\n5. Click register button',
    'Account is created and confirmation email is sent',
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