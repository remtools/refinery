
import { db } from './index.js';

const checkStatuses = async () => {
    await db.connect();
    const statuses = await db.all('SELECT * FROM statuses');
    console.table(statuses);
    await db.close();
};

checkStatuses();
