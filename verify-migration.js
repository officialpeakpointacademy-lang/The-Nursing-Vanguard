
const fs = require("fs");
const path = require("path");
const assert = require("assert");
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

function normalize(value) {
  if (Array.isArray(value)) {
    return value.map(normalize);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = normalize(value[key]);
        return result;
      }, {});
  }

  return value;
}

async function verifyMigration() {
  const client = await pool.connect();

  let passed = 0;
  let failed = 0;

  try {
    console.log("\nVERIFYING MIGRATED DATA\n");

    for (const collection of collections) {
      const filePath = path.join(DATA_DIR, collection.file);

      const source = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      const expected = collection.settings
        ? [{ recordId: "default", data: source }]
        : source.map(record => ({
            recordId: String(record.id),
            data: record
          }));

      const result = await client.query(
        `SELECT record_id, data
         FROM public.app_data
         WHERE collection = $1`,
        [collection.name]
      );

      try {
        assert.strictEqual(
          result.rows.length,
          expected.length,
          "Record count differs"
        );

        const databaseRecords = new Map(
          result.rows.map(row => [
            row.record_id,
            row.data
          ])
        );

        for (const record of expected) {
          assert(
            databaseRecords.has(record.recordId),
            "A source record is missing"
          );

          assert.deepStrictEqual(
            normalize(databaseRecords.get(record.recordId)),
            normalize(record.data),
            "Record contents differ"
          );
        }

        console.log(
          `PASS: ${collection.name} (${expected.length} records)`
        );

        passed++;

      } catch (error) {
        console.log(`FAIL: ${collection.name}`);
        console.log(error.message);
        failed++;
      }
    }

    console.log("\nVERIFICATION SUMMARY");
    console.log("Collections passed:", passed);
    console.log("Collections failed:", failed);

    if (failed > 0) {
      process.exitCode = 1;
    } else {
      console.log("\nALL MIGRATED DATA VERIFIED SUCCESSFULLY.");
    }

  } catch (error) {
    console.error("VERIFICATION ERROR:", error.message);
    process.exitCode = 1;

  } finally {
    client.release();
    await pool.end();
  }
}

verifyMigration();
