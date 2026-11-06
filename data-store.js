
const pool = require("./db");
const { randomUUID } = require("crypto");

/**
 * Read every record in a collection.
 */
async function getCollection(collection) {
  const result = await pool.query(
    `SELECT record_id, data
     FROM app_data
     WHERE collection = $1
     ORDER BY created_at ASC, record_id ASC`,
    [collection]
  );

  return result.rows.map(row => row.data);
}

/**
 * Safely update a collection.
 * The transaction lock ensures two simultaneous updates
 * to the same collection are processed one after another.
 */
async function updateCollection(collection, updater) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "SELECT pg_advisory_xact_lock(hashtext($1))",
      [collection]
    );

    const result = await client.query(
      `SELECT record_id, data
       FROM app_data
       WHERE collection = $1
       ORDER BY created_at ASC, record_id ASC`,
      [collection]
    );

    const records = result.rows.map(row => row.data);
    const updatedRecords = await updater(records);

    if (!Array.isArray(updatedRecords)) {
      throw new Error(
        `Updater for ${collection} must return an array.`
      );
    }

    await client.query(
      "DELETE FROM app_data WHERE collection = $1",
      [collection]
    );

    for (const record of updatedRecords) {
      const recordId =
        record.id ||
        record.completedAt ||
        randomUUID();

      await client.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          collection,
          String(recordId),
          JSON.stringify(record)
        ]
      );
    }

    await client.query("COMMIT");

    return updatedRecords;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Read the single contribution settings record.
 */
async function getContributionSettings() {
  const result = await pool.query(
    `SELECT data
     FROM app_data
     WHERE collection = $1
       AND record_id = $2
     LIMIT 1`,
    ["contribution-settings", "default"]
  );

  return result.rows[0]?.data || null;
}

/**
 * Update the single contribution settings record.
 */
async function saveContributionSettings(settings) {
  await pool.query(
    `INSERT INTO app_data
      (collection, record_id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW(), NOW())
     ON CONFLICT (collection, record_id)
     DO UPDATE SET
       data = EXCLUDED.data,
       updated_at = NOW()`,
    [
      "contribution-settings",
      "default",
      JSON.stringify(settings)
    ]
  );

  return settings;
}

module.exports = {
  getCollection,
  updateCollection,
  getContributionSettings,
  saveContributionSettings
};
