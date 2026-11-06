
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");

const files = [
  "announcements.json",
  "challenge-completions.json",
  "challenges.json",
  "community-posts.json",
  "contribution-audit.json",
  "contribution-settings.json",
  "contributions.json",
  "courses.json",
  "learning-records.json",
  "notes.json",
  "notifications.json",
  "users.json"
];

function describeStructure(value, depth = 0) {
  if (depth > 5) return "Maximum depth reached";

  if (value === null) return "null";

  if (Array.isArray(value)) {
    return {
      type: "array",
      count: value.length,
      itemStructure: value.length
        ? describeStructure(value[0], depth + 1)
        : "empty array"
    };
  }

  if (typeof value === "object") {
    const structure = {};

    for (const key of Object.keys(value)) {
      structure[key] = describeStructure(
        value[key],
        depth + 1
      );
    }

    return structure;
  }

  return typeof value;
}

console.log("\nNURSING VANGUARD DATA INSPECTION\n");

for (const file of files) {
  const filePath = path.join(DATA_DIR, file);

  console.log("\n--------------------------------");
  console.log("FILE:", file);

  if (!fs.existsSync(filePath)) {
    console.log("STATUS: FILE NOT FOUND");
    continue;
  }

  try {
    const data = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    );

    console.log(
      JSON.stringify(
        describeStructure(data),
        null,
        2
      )
    );
  } catch (error) {
    console.log("ERROR:", error.message);
  }
}

console.log("\nINSPECTION COMPLETE\n");
