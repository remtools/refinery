
async function seedViaApi() {
    const API_URL = 'http://localhost:3001/api';

    console.log('--- Starting Seeding via API with Projects ---');

    // 1. Create Project
    const projectData = {
        name: 'Refinery Core Development',
        description: 'Primary project for developing the Refinery requirements management system, focusing on hierarchy and traceability.',
        status: 'Active',
        created_by: 'seed_agent'
    };

    console.log('Creating Project...');
    const projectRes = await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
    });

    if (!projectRes.ok) {
        console.error('Failed to create project:', await projectRes.text());
        return;
    }
    const project = await projectRes.json();
    console.log('Project created successfully!');

    // 2. Create Epic linked to Project
    const epicData = {
        project_id: project.id,
        key: 'REF-001',
        title: 'Modern Requirements Hierarchy',
        description: 'Establish a rock-solid foundation for requirement traceability across Epics, Stories, and Test Cases.',
        created_by: 'seed_agent'
    };

    console.log('Creating Epic...');
    const epicRes = await fetch(`${API_URL}/epics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(epicData)
    });

    if (!epicRes.ok && epicRes.status !== 409) {
        console.error('Failed to create epic:', await epicRes.text());
        return;
    }

    let epic;
    if (epicRes.status === 409) {
        console.log('Epic already exists, fetching it...');
        const epicsRes = await fetch(`${API_URL}/epics`);
        const epics = await epicsRes.json();
        epic = epics.find(e => e.key === epicData.key);
    } else {
        epic = await epicRes.json();
        console.log('Epic created successfully!');
    }

    // 3. Create Story
    const storyData = {
        epic_id: epic.id,
        actor: 'Product Owner',
        action: 'view the full requirements hierarchy',
        outcome: 'I can ensure 100% traceability from Project to Test Case',
        created_by: 'seed_agent'
    };

    console.log('Creating Story...');
    const storyRes = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData)
    });

    if (!storyRes.ok) {
        console.error('Failed to create story:', await storyRes.text());
        return;
    }
    const story = await storyRes.json();
    console.log('Story created successfully!');

    // 4. Create Acceptance Criterion
    const acData = {
        story_id: story.id,
        given: 'I have multiple projects with nested epics, stories and test cases',
        when: 'I navigate through the hierarchy in the dashboard',
        then: 'all related child entities are correctly loaded and displayed',
        risk: 'Medium',
        created_by: 'seed_agent'
    };

    console.log('Creating Acceptance Criterion...');
    const acRes = await fetch(`${API_URL}/acceptance-criteria`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(acData)
    });

    if (!acRes.ok) {
        console.error('Failed to create AC:', await acRes.text());
        return;
    }
    const ac = await acRes.json();
    console.log('AC created successfully!');

    // 5. Create Test Case
    const tcData = {
        acceptance_criterion_id: ac.id,
        preconditions: 'Database contains a complete 5-level hierarchy',
        steps: '1. Click on Project Card\n2. Click "View Epics"\n3. Click "View Stories"\n4. Click "View ACs"',
        expected_result: 'Navigation is fluid starting from Project level',
        priority: 'High',
        created_by: 'seed_agent'
    };

    console.log('Creating Test Case...');
    const tcRes = await fetch(`${API_URL}/test-cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tcData)
    });

    if (!tcRes.ok) {
        console.error('Failed to create Test Case:', await tcRes.text());
        return;
    }
    console.log('Test Case created successfully!');

    // Add another Project for variety
    const project2Data = {
        name: 'Internal Tools UX',
        description: 'Focus on improving the design and usability of internal company tools.',
        status: 'Planned',
        created_by: 'seed_agent'
    };

    console.log('Creating Second Project...');
    await fetch(`${API_URL}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project2Data)
    });

    console.log('\n--- Seeding Completed! ---');
}

seedViaApi().catch(err => {
    console.error('Fatal seeding error:', err);
    process.exit(1);
});
