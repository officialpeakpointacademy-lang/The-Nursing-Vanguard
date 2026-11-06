
const fs = require("fs");
const path = require("path");
const pool = require("./db");

const DATA_DIR = path.join(__dirname, "data");

const collections = [
  { name: "announcements", file: "announcements.json" },
  { name: "challenge-completions", file: "challenge-completions.json" },
  { name: "challenges", file: "challenges.json" },
  { name: "community-posts", file: "community-posts.json" },
  { name: "contribution-audit", file: "contribution-audit.json" },
  { name: "contribution-settings", file: "contribution-settings.json", settings: true },
  { name: "contributions", file: "contributions.json" },
  { name: "courses", file: "courses.json" },
  { name: "learning-records", file: "learning-records.json" },
  { name: "notes", file: "notes.json" },
  { name: "notifications", file: "notifications.json" },
  { name: "users", file: "users.json" }
];

async function migrateData() {
  const client = await pool.connect();

  let totalInserted = 0;
  let totalSkipped = 0;

  try {
    console.log("\nNURSING VANGUARD DATA MIGRATION\n");

    // Read and validate every file before starting the transaction.
    const preparedCollections = collections.map(collection => {
      const filePath = path.join(DATA_DIR, collection.file);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Missing file: ${collection.file}`);
      }

      const data = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      if (collection.settings) {
        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data)
        ) {
          throw new Error(
            `Invalid settings structure: ${collection.file}`
          );
        }

        return {
          name: collection.name,
          records: [
            { recordId: "default", data }
          ]
        };
      }

      if (!Array.isArray(data)) {
        throw new Error(
          `Expected an array in ${collection.file}`
        );
      }

      const records = data.map((record, index) => {
        if (
          !record ||
          typeof record !== "object" ||
          Array.isArray(record) ||
          record.id === undefined ||
          record.id === null ||
          String(record.id).trim() === ""
        ) {
          throw new Error(
            `Invalid record at index ${index} in ${collection.file}`
          );
        }

        return {
          recordId: String(record.id),
          data: record
        };
      });

      return {
        name: collection.name,
        records
      };
    });

    await client.query("BEGIN");

    for (const collection of preparedCollections) {
      let inserted = 0;
      let skipped = 0;

      for (const record of collection.records) {
        const result = await client.query(
          `INSERT INTO public.app_data
            (collection, record_id, data)
           VALUES ($1, $2, $3::jsonb)
           ON CONFLICT (collection, record_id)
           DO NOTHING`,
          [
            collection.name,
            record.recordId,
            JSON.stringify(record.data)
          ]
        );

        if (result.rowCount === 1) {
          inserted++;
        } else {
          skipped++;
        }
      }

      totalInserted += inserted;
      totalSkipped += skipped;

      console.log(
        `${collection.name}: ${inserted} inserted, ${skipped} skipped`
      );
    }

    await client.query("COMMIT");

    console.log("\nMIGRATION COMPLETED");
    console.log("Total inserted:", totalInserted);
    console.log("Total skipped:", totalSkipped);

    const verification = await client.query(`
      SELECT collection, COUNT(*)::int AS records
      FROM public.app_data
      GROUP BY collection
      ORDER BY collection
    `);

    console.log("\nDATABASE VERIFICATION:");

    for (const row of verification.rows) {
      console.log(`${row.collection}: ${row.records}`);
    }

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("\nMIGRATION FAILED:");
    console.error(error.message);
    console.error("Database transaction rolled back.");

    process.exitCode = 1;

  } finally {
    client.release();
    await pool.end();
  }
}

migrateData();
