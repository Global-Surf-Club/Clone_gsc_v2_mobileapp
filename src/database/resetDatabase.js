import { getDatabase, closeDatabase } from './schema';

export const resetDatabaseCompletely = async () => {
  const db = await getDatabase();

  try {
    await db.executeSql('PRAGMA foreign_keys = OFF;');

    const [result] = await db.executeSql(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `);

    const tableNames = [];
    for (let i = 0; i < result.rows.length; i++) {
      tableNames.push(result.rows.item(i).name);
    }

    await db.transaction(tx => {
      tableNames.forEach(table => {
        tx.executeSql(`DELETE FROM ${table}`);
      });
    });

    await db.executeSql('PRAGMA foreign_keys = ON;');
  } catch (error) {
 
    throw error;
  }
};
