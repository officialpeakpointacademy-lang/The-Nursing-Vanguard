const express = require("express");
const session = require("express-session");
const PgSession = require("connect-pg-simple")(session);
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const pool = require("./db");
const { getCollection } = require("./data-store");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const LEARNING_RECORDS_FILE = path.join(
  DATA_DIR,
  "learning-records.json"
);
const ANNOUNCEMENTS_FILE = path.join(
  DATA_DIR,
  "announcements.json"
);
const COURSES_FILE = path.join(
  DATA_DIR,
  "courses.json"
);const NOTES_FILE = path.join(
  DATA_DIR,
  "notes.json"
);
const CONTRIBUTION_SETTINGS_FILE = path.join(
  DATA_DIR,
  "contribution-settings.json"
);

const CONTRIBUTIONS_FILE = path.join(
  DATA_DIR,
  "contributions.json"
);

const CONTRIBUTION_AUDIT_FILE = path.join(
  DATA_DIR,
  "contribution-audit.json"
);
/* =========================================
   CHALLENGES DATA FILES
========================================= */

const CHALLENGES_FILE = path.join(
  DATA_DIR,
  "challenges.json"
);

const CHALLENGE_COMPLETIONS_FILE = path.join(
  DATA_DIR,
  "challenge-completions.json"
);
/* =========================================
   COMMUNITY DATA FILE
========================================= */

const COMMUNITY_POSTS_FILE = path.join(
  DATA_DIR,
  "community-posts.json"
);
/* =========================================
   NOTIFICATIONS DATA FILE
========================================= */

const NOTIFICATIONS_FILE = path.join(
  DATA_DIR,
  "notifications.json"
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isProduction =
  process.env.NODE_ENV === "production" ||
  process.env.NETLIFY === "true";

const sessionSecret =
  process.env.SESSION_SECRET ||
  (isProduction ? null : "local-development-secret-only");

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be configured in production.");
}

if (isProduction) {
  app.set("trust proxy", 1);
}

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "user_sessions",
      createTableIfMissing: true
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

app.use(express.static(path.join(__dirname, "public")));

/* =========================================
   DATABASE HELPERS
========================================= */

function getUsers() {

  return JSON.parse(
    fs.readFileSync(
      USERS_FILE,
      "utf8"
    )
  );
}


function saveUsers(users) {

  fs.writeFileSync(
    USERS_FILE,
    JSON.stringify(users, null, 2)
  );
}

function getLearningRecords() {

  return JSON.parse(
    fs.readFileSync(
      LEARNING_RECORDS_FILE,
      "utf8"
    )
  );
}

function saveLearningRecords(records) {

  fs.writeFileSync(
    LEARNING_RECORDS_FILE,
    JSON.stringify(records, null, 2)
  );
}

function getAnnouncements() {
  return JSON.parse(
    fs.readFileSync(ANNOUNCEMENTS_FILE, "utf8")
  );
}

function saveAnnouncements(announcements) {
  fs.writeFileSync(
    ANNOUNCEMENTS_FILE,
    JSON.stringify(announcements, null, 2)
  );
}

function getCourses() {
  return JSON.parse(
    fs.readFileSync(COURSES_FILE, "utf8")
  );
}

function saveCourses(courses) {
  fs.writeFileSync(
    COURSES_FILE,
    JSON.stringify(courses, null, 2)
  );
}

function getNotes() {
  return JSON.parse(
    fs.readFileSync(NOTES_FILE, "utf8")
  );
}

function saveNotes(notes) {
  fs.writeFileSync(
    NOTES_FILE,
    JSON.stringify(notes, null, 2)
  );
}

/* =========================================
   CHALLENGES HELPERS
========================================= */

function getChallenges() {
  return JSON.parse(
    fs.readFileSync(
      CHALLENGES_FILE,
      "utf8"
    )
  );
}

function saveChallenges(challenges) {
  const tempFile = CHALLENGES_FILE + ".tmp";

  fs.writeFileSync(
    tempFile,
    JSON.stringify(challenges, null, 2)
  );

  fs.renameSync(
    tempFile,
    CHALLENGES_FILE
  );
}

function getChallengeCompletions() {
  return JSON.parse(
    fs.readFileSync(
      CHALLENGE_COMPLETIONS_FILE,
      "utf8"
    )
  );
}

function saveChallengeCompletions(completions) {
  const tempFile =
    CHALLENGE_COMPLETIONS_FILE + ".tmp";

  fs.writeFileSync(
    tempFile,
    JSON.stringify(completions, null, 2)
  );

  fs.renameSync(
    tempFile,
    CHALLENGE_COMPLETIONS_FILE
  );
}

/* =========================================
   COMMUNITY HELPERS
========================================= */

function getCommunityPosts() {
  return JSON.parse(
    fs.readFileSync(
      COMMUNITY_POSTS_FILE,
      "utf8"
    )
  );
}

function saveCommunityPosts(posts) {
  const tempFile = COMMUNITY_POSTS_FILE + ".tmp";

  fs.writeFileSync(
    tempFile,
    JSON.stringify(posts, null, 2)
  );

  fs.renameSync(
    tempFile,
    COMMUNITY_POSTS_FILE
  );
}

/* =========================================
   NOTIFICATIONS HELPERS
========================================= */

function getNotifications() {
  return JSON.parse(
    fs.readFileSync(
      NOTIFICATIONS_FILE,
      "utf8"
    )
  );
}


function saveNotifications(notifications) {
  const tempFile =
    NOTIFICATIONS_FILE + ".tmp";

  fs.writeFileSync(
    tempFile,
    JSON.stringify(notifications, null, 2)
  );

  fs.renameSync(
    tempFile,
    NOTIFICATIONS_FILE
  );
}


async function createNotification({
  userId,
  type,
  title,
  message,
  link,
  relatedId = null
}, client = pool) {
  if (!userId || !type || !title || !message) {
    throw new Error("Required notification details are missing.");
  }

  const notification = {
    id: "NOTIF-" + require("crypto").randomUUID(),
    userId,
    type,
    title,
    message,
    link: link || "/dashboard.html",
    relatedId,
    read: false,
    createdAt: new Date().toISOString()
  };

  await client.query(
    `INSERT INTO app_data
      (collection, record_id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
    ["notifications", notification.id, JSON.stringify(notification)]
  );

  return notification;
}

/* =========================================
   CONTRIBUTIONS HELPERS - POSTGRESQL
========================================= */

async function getContributionSettings(client = pool) {
  const result = await client.query(
    `SELECT data
     FROM app_data
     WHERE collection = $1 AND record_id = $2
     LIMIT 1`,
    ["contribution-settings", "default"]
  );

  return result.rows[0]?.data || {
    active: false,
    monthlyAmount: 0
  };
}

async function getContributions(client = pool) {
  const result = await client.query(
    `SELECT data
     FROM app_data
     WHERE collection = $1
     ORDER BY created_at ASC`,
    ["contributions"]
  );

  return result.rows.map(row => row.data);
}

async function getContributionAudit(client = pool) {
  const result = await client.query(
    `SELECT data
     FROM app_data
     WHERE collection = $1
     ORDER BY created_at DESC`,
    ["contribution-audit"]
  );

  return result.rows.map(row => row.data);
}

function getNigeriaDateParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());

  const values = {};

  parts.forEach(part => {
    values[part.type] = part.value;
  });

  return {
    year: values.year,
    month: values.month,
    day: Number(values.day)
  };
}

function getCurrentContributionPeriod() {
  const date = getNigeriaDateParts();
  return `${date.year}-${date.month}`;
}

function getContributionStatus(record) {
  if (record.status === "paid" || record.status === "waived") {
    return record.status;
  }

  const today = getNigeriaDateParts();

  const currentPeriod =
    `${today.year}-${String(today.month).padStart(2, "0")}`;

  if (record.period < currentPeriod) {
    return "overdue";
  }

  if (record.period === currentPeriod && today.day > 20) {
    return "overdue";
  }

  return "pending";
}

function isValidContributionPeriod(period) {
  return typeof period === "string" &&
    /^\d{4}-(0[1-9]|1[0-2])$/.test(period);
}

function createContributionRecord(member, period, settings) {
  const now = new Date().toISOString();

  return {
    id: `CON-${require("crypto").randomUUID()}`,
    memberId: member.id,
    memberName: member.name,
    period,
    expectedAmount: Number(settings.monthlyAmount) || 0,
    paidAmount: 0,
    status: "pending",
    paymentDate: null,
    paymentReference: "",
    remarks: "",
    recordedBy: null,
    createdAt: now,
    updatedAt: now
  };
}

async function addContributionAudit({
  contributionId,
  action,
  performedBy,
  previousValue,
  newValue,
  reason = ""
}, client = pool) {
  const audit = {
    id: `AUD-${require("crypto").randomUUID()}`,
    contributionId,
    action,
    performedBy,
    previousValue,
    newValue,
    reason,
    timestamp: new Date().toISOString()
  };

  await client.query(
    `INSERT INTO app_data
      (collection, record_id, data, created_at, updated_at)
     VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
    [
      "contribution-audit",
      audit.id,
      JSON.stringify(audit)
    ]
  );

  return audit;
}

/* =========================================
   AUTH MIDDLEWARE
========================================= */

function requireLogin(req, res, next) {

  if (!req.session.user) {

    return res.status(401).json({
      message: "Authentication required."
    });
  }

  next();
}


function requireAdmin(req, res, next) {

  const roles = req.session.user?.roles || [];

  if (
    !roles.includes("admin") &&
    !roles.includes("super_admin")
  ) {

    return res.status(403).json({
      message: "Administrator access required."
    });
  }

  next();
}


/* =========================================
   NOTIFICATION API ROUTES
========================================= */

// GET ALL NOTIFICATIONS FOR LOGGED-IN USER
app.get(
  "/api/notifications",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND data->>'userId' = $2
         ORDER BY created_at DESC`,
        ["notifications", req.session.user.id]
      );

      const notifications = result.rows.map(row => row.data);

      res.json({
        notifications,
        unreadCount: notifications.filter(item => !item.read).length
      });

    } catch (error) {
      console.error("Load notifications error:", error);
      res.status(500).json({
        message: "Unable to load notifications."
      });
    }
  }
);


// MARK ONE NOTIFICATION AS READ
app.patch(
  "/api/notifications/:id/read",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE app_data
         SET data = jsonb_set(data, '{read}', 'true'::jsonb),
             updated_at = NOW()
         WHERE collection = $1
           AND record_id = $2
           AND data->>'userId' = $3
         RETURNING data`,
        ["notifications", req.params.id, req.session.user.id]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          message: "Notification not found."
        });
      }

      res.json({
        message: "Notification marked as read.",
        notification: result.rows[0].data
      });

    } catch (error) {
      console.error("Mark notification read error:", error);
      res.status(500).json({
        message: "Unable to update notification."
      });
    }
  }
);


// MARK ALL USER NOTIFICATIONS AS READ
app.patch(
  "/api/notifications/read-all",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `UPDATE app_data
         SET data = jsonb_set(data, '{read}', 'true'::jsonb),
             updated_at = NOW()
         WHERE collection = $1
           AND data->>'userId' = $2
           AND COALESCE((data->>'read')::boolean, false) = false`,
        ["notifications", req.session.user.id]
      );

      res.json({
        message: "All notifications marked as read.",
        updatedCount: result.rowCount
      });

    } catch (error) {
      console.error("Mark all notifications read error:", error);
      res.status(500).json({
        message: "Unable to update notifications."
      });
    }
  }
);

/* =========================================
   LOGIN
========================================= */


app.post("/api/auth/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({
        message: "Enter your Vanguard ID and password."
      });
    }

    const users = await getCollection("users");

    const user = users.find(
      u => u.id.toLowerCase() === id.trim().toLowerCase()
    );

    if (
      !user ||
      !await bcrypt.compare(password, user.passwordHash)
    ) {
      return res.status(401).json({
        message: "Invalid Vanguard ID or password."
      });
    }

    req.session.user = {
      id: user.id,
      name: user.name,
      roles: user.roles,
      mustChangePassword: user.mustChangePassword
    };

    res.json({
      message: "Login successful.",
      user: req.session.user
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Unable to complete login."
    });
  }
});

/* =========================================
   CURRENT USER
========================================= */

app.get(
  "/api/auth/me",
  (req, res) => {

    res.json({
      user:
        req.session.user || null
    });
  }
);


/* =========================================
   LOGOUT
========================================= */

app.post(
  "/api/auth/logout",
  (req, res) => {

    req.session.destroy(() => {

      res.json({
        message: "Logged out."
      });

    });
  }
);


/* =========================================
   CHANGE PASSWORD
========================================= */


app.post(
  "/api/auth/change-password",
  requireLogin,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (
        !currentPassword ||
        !newPassword ||
        newPassword.length < 8
      ) {
        return res.status(400).json({
          message: "New password must contain at least 8 characters."
        });
      }

      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         LIMIT 1`,
        ["users", req.session.user.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      const user = result.rows[0].data;

      const valid = await bcrypt.compare(
        currentPassword,
        user.passwordHash
      );

      if (!valid) {
        return res.status(401).json({
          message: "Current password is incorrect."
        });
      }

      const newHash = await bcrypt.hash(newPassword, 12);

      const update = await pool.query(
        `UPDATE app_data
         SET data = jsonb_set(
           jsonb_set(data, '{passwordHash}', to_jsonb($1::text)),
           '{mustChangePassword}',
           'false'::jsonb
         ),
         updated_at = NOW()
         WHERE collection = $2 AND record_id = $3`,
        [newHash, "users", req.session.user.id]
      );

      if (!update.rowCount) {
        return res.status(404).json({
          message: "User not found."
        });
      }

      req.session.user.mustChangePassword = false;

      res.json({
        message: "Password changed successfully."
      });
    } catch (error) {
      console.error("Change password error:", error);

      res.status(500).json({
        message: "Unable to change password."
      });
    }
  }
);

/* =========================================
   LEARNING RECORDS
========================================= */

function getTodayDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}


function getPreviousLearningDate(dateString) {
  const date = new Date(
    dateString + "T00:00:00"
  );

  const day = date.getDay();

  if (day === 1) {
    // Monday → previous required day is Friday
    date.setDate(date.getDate() - 3);
  } else {
    // Tuesday-Friday → previous day
    date.setDate(date.getDate() - 1);
  }

  return date
    .toISOString()
    .split("T")[0];
}

// SAVE A NEW LEARNING RECORD

app.post(
  "/api/learning-records",
  requireLogin,
  async (req, res) => {
    const {
      date,
      day,
      course,
      lecturer,
      learned,
      takeaway
    } = req.body;

    if (!date || !day || !course || !lecturer || !learned) {
      return res.status(400).json({
        message: "Please complete all required fields."
      });
    }

    const today = getTodayDate();

    if (date !== today) {
      return res.status(400).json({
        message: "Learning records can only be submitted for today."
      });
    }

    const todayDay = new Intl.DateTimeFormat("en-NG", {
      timeZone: "Africa/Lagos",
      weekday: "long"
    }).format(new Date());

    if (todayDay === "Saturday" || todayDay === "Sunday") {
      return res.status(400).json({
        message: "Learning records are available from Monday to Friday."
      });
    }

    if (day !== todayDay) {
      return res.status(400).json({
        message: "The selected day does not match today's date."
      });
    }

    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Lock the user's row to prevent duplicate submissions
      // and simultaneous XP updates.
      const userResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["users", req.session.user.id]
      );

      if (!userResult.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "User account not found."
        });
      }

      const currentUser = userResult.rows[0].data;

      // Prevent duplicate records for the same date.
      const duplicateResult = await client.query(
        `SELECT 1
         FROM app_data
         WHERE collection = $1
           AND data->>'userId' = $2
           AND data->>'date' = $3
         LIMIT 1`,
        ["learning-records", req.session.user.id, date]
      );

      if (duplicateResult.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message: "You have already submitted a learning record for this date."
        });
      }

      // Check the previous required learning day.
      const previousLearningDate = getPreviousLearningDate(date);

      const previousResult = await client.query(
        `SELECT 1
         FROM app_data
         WHERE collection = $1
           AND data->>'userId' = $2
           AND data->>'date' = $3
         LIMIT 1`,
        ["learning-records", currentUser.id, previousLearningDate]
      );

      // Award XP and calculate streak.
      currentUser.xp = (currentUser.xp || 0) + 20;

      currentUser.streak = previousResult.rows.length
        ? (currentUser.streak || 0) + 1
        : 1;

      currentUser.lastLearningDate = date;

      const newRecord = {
        id: Date.now().toString(),
        userId: currentUser.id,
        userName: currentUser.name,
        date,
        day,
        course,
        lecturer,
        learned,
        takeaway: takeaway || "",
        createdAt: new Date().toISOString()
      };

      // Save the learning record.
      await client.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          "learning-records",
          newRecord.id,
          JSON.stringify(newRecord)
        ]
      );

      // Save the updated user data.
      await client.query(
        `UPDATE app_data
         SET data = $1::jsonb,
             updated_at = NOW()
         WHERE collection = $2 AND record_id = $3`,
        [
          JSON.stringify(currentUser),
          "users",
          currentUser.id
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      res.status(201).json({
        message: "Learning record saved successfully.",
        record: newRecord,
        xp: currentUser.xp,
        streak: currentUser.streak,
        earnedXp: 20
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK");
      }

      console.error("Learning record error:", error);

      res.status(500).json({
        message: "Unable to save learning record."
      });

    } finally {
      client.release();
    }
  }
);


/* =========================================
   MEMBER CHALLENGES — POSTGRESQL
========================================= */

// GET AVAILABLE CHALLENGES
app.get(
  "/api/challenges",
  requireLogin,
  async (req, res) => {
    try {
      const [challengeResult, completionResult] = await Promise.all([
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1
           ORDER BY created_at ASC`,
          ["challenges"]
        ),
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1
             AND data->>'userId' = $2`,
          ["challenge-completions", req.session.user.id]
        )
      ]);

      const challenges = challengeResult.rows.map(row => row.data);
      const completions = completionResult.rows.map(row => row.data);

      const today = getTodayDate();

      const userChallenges = challenges
        .filter(challenge => challenge.status === "published")
        .map(challenge => {
          const completion = completions.find(
            item => item.challengeId === challenge.id
          );

          return {
            ...challenge,
            progress: completion ? completion.status : "not_started",
            startedAt: completion ? completion.startedAt : null,
            completedAt: completion ? completion.completedAt : null
          };
        });

      res.json({
        challenges: userChallenges,
        today
      });

    } catch (error) {
      console.error("Get challenges error:", error);

      res.status(500).json({
        message: "Unable to load challenges."
      });
    }
  }
);


// START A CHALLENGE
app.post(
  "/api/challenges/:id/start",
  requireLogin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const challengeId = req.params.id;
      const userId = req.session.user.id;

      // Prevent simultaneous duplicate starts by the same member.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        [`challenge:${challengeId}:${userId}`]
      );

      const challengeResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND record_id = $2
         FOR UPDATE`,
        ["challenges", challengeId]
      );

      const challenge = challengeResult.rows[0]?.data;

      if (!challenge || challenge.status !== "published") {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Challenge not found or unavailable."
        });
      }

      const existingResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND data->>'challengeId' = $2
           AND data->>'userId' = $3
         LIMIT 1`,
        ["challenge-completions", challengeId, userId]
      );

      if (existingResult.rows.length > 0) {
        const existingCompletion = existingResult.rows[0].data;

        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "You have already started this challenge.",
          progress: existingCompletion.status
        });
      }

      const newCompletion = {
        id: "CMP-" + require("crypto").randomUUID(),
        challengeId,
        userId,
        userName: req.session.user.name,
        status: "in_progress",
        startedAt: new Date().toISOString(),
        completedAt: null,
        xpAwarded: 0
      };

      await client.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          "challenge-completions",
          newCompletion.id,
          JSON.stringify(newCompletion)
        ]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Challenge started successfully.",
        completion: newCompletion
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Start challenge error:", error);

      res.status(500).json({
        message: "Unable to start challenge."
      });

    } finally {
      client.release();
    }
  }
);


// COMPLETE A CHALLENGE
app.post(
  "/api/challenges/:id/complete",
  requireLogin,
  async (req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const challengeId = req.params.id;
      const userId = req.session.user.id;

      const challengeResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND record_id = $2`,
        ["challenges", challengeId]
      );

      const challenge = challengeResult.rows[0]?.data;

      if (!challenge || challenge.status !== "published") {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Challenge not found or unavailable."
        });
      }

      // Lock this member's completion record.
      const completionResult = await client.query(
        `SELECT record_id, data
         FROM app_data
         WHERE collection = $1
           AND data->>'challengeId' = $2
           AND data->>'userId' = $3
         LIMIT 1
         FOR UPDATE`,
        ["challenge-completions", challengeId, userId]
      );

      if (completionResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Start this challenge before completing it."
        });
      }

      const completionRow = completionResult.rows[0];
      const completion = completionRow.data;

      if (completion.status === "completed") {
        await client.query("ROLLBACK");

        return res.status(409).json({
          message: "You have already completed this challenge."
        });
      }

      if (completion.status !== "in_progress") {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "This challenge cannot be completed."
        });
      }

      // Lock the member's account before updating XP.
      const userResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND record_id = $2
         FOR UPDATE`,
        ["users", userId]
      );

      if (userResult.rows.length === 0) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "User account not found."
        });
      }

      const currentUser = userResult.rows[0].data;
      const earnedXp = Number(challenge.xpReward);

      if (
        !Number.isSafeInteger(earnedXp) ||
        earnedXp <= 0
      ) {
        await client.query("ROLLBACK");

        return res.status(400).json({
          message: "Invalid challenge XP reward."
        });
      }

      const currentXp = Number(currentUser.xp || 0);

      if (!Number.isSafeInteger(currentXp) || currentXp < 0) {
        throw new Error("Invalid member XP balance.");
      }

      const totalXp = currentXp + earnedXp;

      // Update the completion record.
      completion.status = "completed";
      completion.completedAt = new Date().toISOString();
      completion.xpAwarded = earnedXp;

      await client.query(
        `UPDATE app_data
         SET data = $1::jsonb,
             updated_at = NOW()
         WHERE collection = $2
           AND record_id = $3`,
        [
          JSON.stringify(completion),
          "challenge-completions",
          completionRow.record_id
        ]
      );

      // Award XP to the member.
      const updatedUser = {
        ...currentUser,
        xp: totalXp
      };

      await client.query(
        `UPDATE app_data
         SET data = $1::jsonb,
             updated_at = NOW()
         WHERE collection = $2
           AND record_id = $3`,
        [
          JSON.stringify(updatedUser),
          "users",
          userId
        ]
      );

      // Both changes succeed together or neither is saved.
      await client.query("COMMIT");

      res.json({
        message: "Challenge completed successfully!",
        earnedXp,
        totalXp,
        completion
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Complete challenge error:", error);

      res.status(500).json({
        message: "Unable to complete challenge."
      });

    } finally {
      client.release();
    }
  }
);

/* =========================================
   COMMUNITY - MEMBER POSTS
========================================= */

// GET COMMUNITY POSTS
app.get(
  "/api/community/posts",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY created_at DESC`,
        ["community-posts"]
      );

      res.json({
        posts: result.rows.map(row => row.data)
      });

    } catch (error) {
      console.error("Get community posts error:", error);
      res.status(500).json({
        message: "Unable to load community posts."
      });
    }
  }
);


// CREATE COMMUNITY POST
app.post(
  "/api/community/posts",
  requireLogin,
  async (req, res) => {
    try {
      const { content, category } = req.body;

      const allowedCategories = [
        "General",
        "Academic",
        "Clinical",
        "Questions",
        "Resources"
      ];

      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          message: "Please enter something to share."
        });
      }

      if (content.trim().length > 5000) {
        return res.status(400).json({
          message: "Your post cannot exceed 5,000 characters."
        });
      }

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          message: "Please select a valid post category."
        });
      }

      const post = {
        id: "POST-" + require("crypto").randomUUID(),
        authorId: req.session.user.id,
        authorName: req.session.user.name,
        content: content.trim(),
        category,
        reactions: [],
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: null
      };

      await pool.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        ["community-posts", post.id, JSON.stringify(post)]
      );

      res.status(201).json({
        message: "Your post has been published.",
        post
      });

    } catch (error) {
      console.error("Create community post error:", error);
      res.status(500).json({
        message: "Unable to publish your post."
      });
    }
  }
);


// DELETE COMMUNITY POST
app.delete(
  "/api/community/posts/:id",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2`,
        ["community-posts", req.params.id]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          message: "Post not found."
        });
      }

      const post = result.rows[0].data;
      const roles = req.session.user.roles || [];

      const isAdmin =
        roles.includes("admin") ||
        roles.includes("super_admin");

      const isAuthor = post.authorId === req.session.user.id;

      if (!isAuthor && !isAdmin) {
        return res.status(403).json({
          message: "You cannot delete this post."
        });
      }

      await pool.query(
        `DELETE FROM app_data
         WHERE collection = $1 AND record_id = $2`,
        ["community-posts", req.params.id]
      );

      res.json({
        message: "Post deleted successfully."
      });

    } catch (error) {
      console.error("Delete community post error:", error);
      res.status(500).json({
        message: "Unable to delete this post."
      });
    }
  }
);


// TOGGLE COMMUNITY POST REACTION
app.post(
  "/api/community/posts/:id/reactions",
  requireLogin,
  async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      const result = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["community-posts", req.params.id]
      );

      if (!result.rowCount) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Community post not found."
        });
      }

      const post = result.rows[0].data;

      if (!Array.isArray(post.reactions)) {
        post.reactions = [];
      }

      const userId = req.session.user.id;
      const existingIndex = post.reactions.indexOf(userId);

      let reacted;

      if (existingIndex !== -1) {
        post.reactions.splice(existingIndex, 1);
        reacted = false;
      } else {
        post.reactions.push(userId);
        reacted = true;
      }

      post.updatedAt = new Date().toISOString();

      await client.query(
        `UPDATE app_data
         SET data = $3::jsonb, updated_at = NOW()
         WHERE collection = $1 AND record_id = $2`,
        ["community-posts", post.id, JSON.stringify(post)]
      );

      if (reacted && post.authorId !== userId) {
        await createNotification({
          userId: post.authorId,
          type: "community_reaction",
          title: "New reaction to your post",
          message: `${req.session.user.name} reacted to your community post.`,
          link: "/community.html",
          relatedId: post.id
        }, client);
      }

      await client.query("COMMIT");
      transactionStarted = false;

      res.json({
        message: reacted
          ? "Reaction added successfully."
          : "Reaction removed successfully.",
        reacted,
        reactionCount: post.reactions.length,
        postId: post.id
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Community reaction error:", error);
      res.status(500).json({
        message: "Unable to update reaction."
      });

    } finally {
      client.release();
    }
  }
);


// ADD COMMUNITY POST COMMENT
app.post(
  "/api/community/posts/:id/comments",
  requireLogin,
  async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      const { content } = req.body;

      if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({
          message: "Please enter a comment."
        });
      }

      if (content.trim().length > 2000) {
        return res.status(400).json({
          message: "Comment cannot exceed 2,000 characters."
        });
      }

      await client.query("BEGIN");
      transactionStarted = true;

      const result = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["community-posts", req.params.id]
      );

      if (!result.rowCount) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Community post not found."
        });
      }

      const post = result.rows[0].data;

      if (!Array.isArray(post.comments)) {
        post.comments = [];
      }

      const comment = {
        id: "COMMENT-" + require("crypto").randomUUID(),
        authorId: req.session.user.id,
        authorName: req.session.user.name,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };

      post.comments.push(comment);
      post.updatedAt = new Date().toISOString();

      await client.query(
        `UPDATE app_data
         SET data = $3::jsonb, updated_at = NOW()
         WHERE collection = $1 AND record_id = $2`,
        ["community-posts", post.id, JSON.stringify(post)]
      );

      if (post.authorId !== req.session.user.id) {
        await createNotification({
          userId: post.authorId,
          type: "community_comment",
          title: "New comment on your post",
          message: `${req.session.user.name} commented on your community post.`,
          link: "/community.html",
          relatedId: post.id
        }, client);
      }

      await client.query("COMMIT");
      transactionStarted = false;

      res.status(201).json({
        message: "Comment added successfully.",
        comment,
        postId: post.id
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Add community comment error:", error);
      res.status(500).json({
        message: "Unable to add comment."
      });

    } finally {
      client.release();
    }
  }
);


// DELETE A COMMENT
app.delete(
  "/api/community/posts/:postId/comments/:commentId",
  requireLogin,
  async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      const result = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["community-posts", req.params.postId]
      );

      if (!result.rowCount) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Post not found."
        });
      }

      const post = result.rows[0].data;
      post.comments = Array.isArray(post.comments) ? post.comments : [];

      const commentIndex = post.comments.findIndex(
        item => item.id === req.params.commentId
      );

      if (commentIndex === -1) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Comment not found."
        });
      }

      const comment = post.comments[commentIndex];
      const roles = req.session.user.roles || [];

      const isAdmin =
        roles.includes("admin") ||
        roles.includes("super_admin");

      const isAuthor = comment.authorId === req.session.user.id;

      if (!isAuthor && !isAdmin) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(403).json({
          message: "You cannot delete this comment."
        });
      }

      post.comments.splice(commentIndex, 1);
      post.updatedAt = new Date().toISOString();

      await client.query(
        `UPDATE app_data
         SET data = $3::jsonb, updated_at = NOW()
         WHERE collection = $1 AND record_id = $2`,
        ["community-posts", post.id, JSON.stringify(post)]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      res.json({
        message: "Comment deleted successfully.",
        comments: post.comments
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Delete community comment error:", error);
      res.status(500).json({
        message: "Unable to delete comment."
      });

    } finally {
      client.release();
    }
  }
);

// GET LOGGED-IN MEMBER'S LEARNING RECORDS
app.get(
  "/api/learning-records",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND data->>'userId' = $2
         ORDER BY created_at DESC`,
        ["learning-records", req.session.user.id]
      );

      res.json({
        records: result.rows.map(row => row.data)
      });
    } catch (error) {
      console.error("Get learning records error:", error);
      res.status(500).json({
        message: "Unable to load learning records."
      });
    }
  }
);

/* =========================================
   DASHBOARD LEARNING SUMMARY
========================================= */

app.get(
  "/api/dashboard/learning-summary",
  requireLogin,
  async (req, res) => {
    try {
      const userResult = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         LIMIT 1`,
        ["users", req.session.user.id]
      );

      if (!userResult.rows.length) {
        return res.status(404).json({
          message: "User account not found."
        });
      }

      const currentUser = userResult.rows[0].data;

      const recordsResult = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND data->>'userId' = $2
         ORDER BY created_at DESC`,
        ["learning-records", req.session.user.id]
      );

      const userRecords = recordsResult.rows.map(
        row => row.data
      );

      const today = getTodayDate();

      const todayCompleted = userRecords.some(
        record => record.date === today
      );

      res.json({
        todayCompleted,
        streak: currentUser.streak || 0,
        xp: currentUser.xp || 0,
        totalRecords: userRecords.length,
        recentRecords: userRecords.slice(0, 5)
      });
    } catch (error) {
      console.error("Learning summary error:", error);
      res.status(500).json({
        message: "Unable to load learning summary."
      });
    }
  }
);

/* =========================================
   COMMUNITY LEADERBOARD
========================================= */

app.get(
  "/api/leaderboard",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1`,
        ["users"]
      );

      const users = result.rows.map(row => row.data);

      const members = users
        .filter(
          user =>
            user.roles &&
            user.roles.includes("member")
        )
        .map(user => ({
          id: user.id,
          name: user.name,
          xp: user.xp || 0,
          streak: user.streak || 0
        }))
        .sort((a, b) => {
          if (b.xp !== a.xp) {
            return b.xp - a.xp;
          }

          return b.streak - a.streak;
        });

      const leaderboard = members.map(
        (member, index) => ({
          rank: index + 1,
          ...member
        })
      );

      const currentUser = leaderboard.find(
        member => member.id === req.session.user.id
      );

      res.json({
        leaderboard,
        currentUser
      });

    } catch (error) {
      console.error("Leaderboard error:", error);

      res.status(500).json({
        message: "Unable to load leaderboard."
      });
    }
  }
);

/* =========================================
   MEMBER PROFILE
========================================= */

app.get(
  "/api/profile",
  requireLogin,
  async (req, res) => {
    try {
      const [usersResult, recordsResult] = await Promise.all([
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["users"]
        ),

        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1
             AND data->>'userId' = $2
           ORDER BY created_at DESC`,
          ["learning-records", req.session.user.id]
        )
      ]);

      const users = usersResult.rows.map(row => row.data);

      const currentUser = users.find(
        user => user.id === req.session.user.id
      );

      if (!currentUser) {
        return res.status(404).json({
          message: "User account not found."
        });
      }

      const userRecords = recordsResult.rows.map(
        row => row.data
      );

      // Calculate community ranking.
      const members = users
        .filter(
          user =>
            user.roles &&
            user.roles.includes("member")
        )
        .sort((a, b) => {
          const xpDifference =
            (b.xp || 0) - (a.xp || 0);

          if (xpDifference !== 0) {
            return xpDifference;
          }

          return (b.streak || 0) - (a.streak || 0);
        });

      const rank =
        members.findIndex(
          member => member.id === currentUser.id
        ) + 1;

      res.json({
        profile: {
          id: currentUser.id,
          name: currentUser.name,
          xp: currentUser.xp || 0,
          streak: currentUser.streak || 0,
          rank,
          totalRecords: userRecords.length,
          recentRecords: userRecords.slice(0, 5)
        }
      });

    } catch (error) {
      console.error("Get profile error:", error);

      res.status(500).json({
        message: "Unable to load member profile."
      });
    }
  }
);

/* =========================================
   ADMIN - CHALLENGES
========================================= */

// GET ALL CHALLENGES
app.get(
  "/api/admin/challenges",
  requireAdmin,
  async (req, res) => {
    try {
      const [challengeResult, completionResult] = await Promise.all([
        pool.query(
          `SELECT data FROM app_data
           WHERE collection = 'challenges'
           ORDER BY created_at DESC`
        ),
        pool.query(
          `SELECT data FROM app_data
           WHERE collection = 'challenge-completions'`
        )
      ]);

      const challenges = challengeResult.rows.map(row => row.data);
      const completions = completionResult.rows.map(row => row.data);

      const result = challenges.map(challenge => {
        const challengeCompletions = completions.filter(
          item => item.challengeId === challenge.id
        );

        return {
          ...challenge,
          totalStarted: challengeCompletions.length,
          totalCompleted: challengeCompletions.filter(
            item => item.status === "completed"
          ).length
        };
      });

      res.json({ challenges: result });

    } catch (error) {
      console.error("Admin challenges error:", error);
      res.status(500).json({
        message: "Unable to load challenges."
      });
    }
  }
);


// CREATE A CHALLENGE
app.post(
  "/api/admin/challenges",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        type,
        xpReward,
        startDate,
        endDate
      } = req.body;

      if (
        typeof title !== "string" ||
        !title.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        !category ||
        !type ||
        !Number.isSafeInteger(Number(xpReward)) ||
        Number(xpReward) <= 0 ||
        !startDate ||
        !endDate
      ) {
        return res.status(400).json({
          message: "Please provide valid challenge details."
        });
      }

      if (
        !["academic", "clinical", "consistency", "community"].includes(category) ||
        !["daily", "weekly"].includes(type)
      ) {
        return res.status(400).json({
          message: "Invalid challenge category or type."
        });
      }

      if (endDate < startDate) {
        return res.status(400).json({
          message: "End date cannot be before start date."
        });
      }

      const newChallenge = {
        id: "CH-" + Date.now() + "-" + require("crypto").randomUUID(),
        title: title.trim(),
        description: description.trim(),
        category,
        type,
        xpReward: Number(xpReward),
        startDate,
        endDate,
        status: "draft",
        createdBy: req.session.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: null
      };

      await pool.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          "challenges",
          newChallenge.id,
          JSON.stringify(newChallenge)
        ]
      );

      res.status(201).json({
        message: "Challenge created successfully.",
        challenge: newChallenge
      });

    } catch (error) {
      console.error("Create challenge error:", error);
      res.status(500).json({
        message: "Unable to create challenge."
      });
    }
  }
);


// UPDATE A CHALLENGE
app.patch(
  "/api/admin/challenges/:id",
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      const allowedFields = [
        "title",
        "description",
        "category",
        "type",
        "xpReward",
        "startDate",
        "endDate"
      ];

      const updates = req.body;

      if (
        !updates ||
        typeof updates !== "object" ||
        Array.isArray(updates) ||
        Object.keys(updates).length === 0 ||
        Object.keys(updates).some(
          key => !allowedFields.includes(key)
        )
      ) {
        return res.status(400).json({
          message: "Invalid challenge update."
        });
      }

      await client.query("BEGIN");
      transactionStarted = true;

      const result = await client.query(
        `SELECT data FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["challenges", req.params.id]
      );

      if (!result.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Challenge not found."
        });
      }

      const existing = result.rows[0].data;

      const updated = {
        ...existing,
        ...updates
      };

      if (typeof updated.title === "string") {
        updated.title = updated.title.trim();
      }

      if (typeof updated.description === "string") {
        updated.description = updated.description.trim();
      }

      updated.xpReward = Number(updated.xpReward);

      if (
        !updated.title ||
        !updated.description ||
        !Number.isSafeInteger(updated.xpReward) ||
        updated.xpReward <= 0 ||
        !["academic", "clinical", "consistency", "community"].includes(updated.category) ||
        !["daily", "weekly"].includes(updated.type) ||
        !updated.startDate ||
        !updated.endDate ||
        updated.endDate < updated.startDate
      ) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(400).json({
          message: "Challenge details are invalid."
        });
      }

      const finalChallenge = {
        ...updated,
        updatedAt: new Date().toISOString()
      };

      await client.query(
        `UPDATE app_data
         SET data = $3::jsonb, updated_at = NOW()
         WHERE collection = $1 AND record_id = $2`,
        [
          "challenges",
          req.params.id,
          JSON.stringify(finalChallenge)
        ]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      res.json({
        message: "Challenge updated successfully.",
        challenge: finalChallenge
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Update challenge error:", error);
      res.status(500).json({
        message: "Unable to update challenge."
      });

    } finally {
      client.release();
    }
  }
);


// CHANGE CHALLENGE STATUS
app.patch(
  "/api/admin/challenges/:id/status",
  requireAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      if (!["draft", "published", "inactive"].includes(status)) {
        return res.status(400).json({
          message: "Invalid challenge status."
        });
      }

      const updatedAt = new Date().toISOString();

      const result = await pool.query(
        `UPDATE app_data
         SET data = data || jsonb_build_object(
           'status', $3::text,
           'updatedAt', $4::text
         ),
         updated_at = NOW()
         WHERE collection = $1 AND record_id = $2
         RETURNING data`,
        [
          "challenges",
          req.params.id,
          status,
          updatedAt
        ]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          message: "Challenge not found."
        });
      }

      res.json({
        message: "Challenge status updated successfully.",
        challenge: result.rows[0].data
      });

    } catch (error) {
      console.error("Change challenge status error:", error);
      res.status(500).json({
        message: "Unable to update challenge status."
      });
    }
  }
);


// DELETE A CHALLENGE
app.delete(
  "/api/admin/challenges/:id",
  requireAdmin,
  async (req, res) => {
    const client = await pool.connect();
    let transactionStarted = false;

    try {
      await client.query("BEGIN");
      transactionStarted = true;

      // Lock the challenge so a member cannot start it
      // while an admin is attempting to delete it.
      const challengeResult = await client.query(
        `SELECT data FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["challenges", req.params.id]
      );

      if (!challengeResult.rows.length) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(404).json({
          message: "Challenge not found."
        });
      }

      const challenge = challengeResult.rows[0].data;

      const completionResult = await client.query(
        `SELECT EXISTS (
           SELECT 1 FROM app_data
           WHERE collection = $1
           AND data->>'challengeId' = $2
         ) AS has_started`,
        ["challenge-completions", challenge.id]
      );

      if (completionResult.rows[0].has_started) {
        await client.query("ROLLBACK");
        transactionStarted = false;

        return res.status(409).json({
          message:
            "This challenge cannot be deleted because members have already started it. Deactivate it instead."
        });
      }

      await client.query(
        `DELETE FROM app_data
         WHERE collection = $1 AND record_id = $2`,
        ["challenges", req.params.id]
      );

      await client.query("COMMIT");
      transactionStarted = false;

      res.json({
        message: "Challenge deleted successfully."
      });

    } catch (error) {
      if (transactionStarted) {
        await client.query("ROLLBACK").catch(() => {});
      }

      console.error("Delete challenge error:", error);
      res.status(500).json({
        message: "Unable to delete challenge."
      });

    } finally {
      client.release();
    }
  }
);

/* =========================================
   ADMIN - MEMBERS
========================================= */

app.get(
  "/api/members",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY created_at ASC`,
        ["users"]
      );

      const users = result.rows.map(row => {
        const {
          passwordHash,
          ...safeUser
        } = row.data;

        return safeUser;
      });

      res.json(users);

    } catch (error) {
      console.error("Load members error:", error);
      res.status(500).json({
        message: "Unable to load members."
      });
    }
  }
);


/* =========================================
   ADMIN - BASIC STATISTICS
========================================= */

app.get(
  "/api/admin/stats",
  requireAdmin,
  async (req, res) => {
    try {
      const [usersResult, recordsResult] = await Promise.all([
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["users"]
        ),
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["learning-records"]
        )
      ]);

      const users = usersResult.rows.map(row => row.data);
      const records = recordsResult.rows.map(row => row.data);

      const dateParts = getNigeriaDateParts();
      const today =
        `${dateParts.year}-${dateParts.month}-${String(dateParts.day).padStart(2, "0")}`;

      const activeTodayIds = new Set(
        records
          .filter(record => record.date === today)
          .map(record => record.userId)
      );

      const outstandingMembers = users.filter(user =>
        user.roles?.includes("member") &&
        !activeTodayIds.has(user.id)
      ).length;

      res.json({
        members: users.length,
        activeToday: activeTodayIds.size,
        learningRecords: records.length,
        outstandingMembers
      });

    } catch (error) {
      console.error("Admin statistics error:", error);
      res.status(500).json({
        message: "Unable to load dashboard statistics."
      });
    }
  }
);


/* =========================================
   ADMIN - ALL LEARNING RECORDS
========================================= */

app.get(
  "/api/admin/learning-records",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY created_at DESC`,
        ["learning-records"]
      );

      const records = result.rows
        .map(row => row.data)
        .sort((a, b) =>
          new Date(b.createdAt) - new Date(a.createdAt)
        );

      res.json({ records });

    } catch (error) {
      console.error("Admin learning records error:", error);
      res.status(500).json({
        message: "Unable to load learning records."
      });
    }
  }
);

/* =========================================
   MEMBER PAGE
========================================= */

app.get(
  "/member",
  requireLogin,

  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "dashboard.html"
      )
    );
  }
);


/* =========================================
   ADMIN PAGE
========================================= */

app.get(
  "/admin",
  requireAdmin,

  (req, res) => {

    res.sendFile(
      path.join(
        __dirname,
        "public",
        "admin.html"
      )
    );
  }
);

/* =========================================
   ANNOUNCEMENTS
========================================= */

// GET ANNOUNCEMENTS
app.get(
  "/api/announcements",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY data->>'createdAt' DESC`,
        ["announcements"]
      );

      const publishedAnnouncements = result.rows
        .map(row => row.data)
        .filter(announcement => announcement.published !== false);

      res.json({
        announcements: publishedAnnouncements
      });

    } catch (error) {
      console.error("Get announcements error:", error);

      res.status(500).json({
        message: "Unable to load announcements."
      });
    }
  }
);


// CREATE ANNOUNCEMENT
app.post(
  "/api/admin/announcements",
  requireAdmin,
  async (req, res) => {
    try {
      const { title, category, content } = req.body;

      if (
        typeof title !== "string" ||
        typeof content !== "string" ||
        !title.trim() ||
        !content.trim() ||
        !category
      ) {
        return res.status(400).json({
          message: "Please provide a title, category and content."
        });
      }

      const allowedCategories = [
        "General",
        "Academic",
        "Assessment",
        "Event",
        "Important"
      ];

      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          message: "Invalid announcement category."
        });
      }

      const newAnnouncement = {
        id: require("crypto").randomUUID(),
        title: title.trim(),
        category,
        content: content.trim(),
        author: req.session.user.name,
        authorId: req.session.user.id,
        published: true,
        createdAt: new Date().toISOString()
      };

      await pool.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          "announcements",
          newAnnouncement.id,
          JSON.stringify(newAnnouncement)
        ]
      );

      // Notify all other members.
      const users = await getCollection("users");

      const memberUsers = users.filter(user =>
        Array.isArray(user.roles) &&
        user.roles.includes("member") &&
        user.id !== req.session.user.id
      );

      await Promise.all(
        memberUsers.map(user =>
          createNotification({
            userId: user.id,
            type: "announcement",
            title: "New Announcement",
            message: `A new announcement has been published: ${newAnnouncement.title}`,
            link: "/dashboard.html",
            relatedId: newAnnouncement.id
          })
        )
      );

      return res.status(201).json({
        message: "Announcement published successfully.",
        announcement: newAnnouncement
      });

    } catch (error) {
      console.error("Create announcement error:", error);

      return res.status(500).json({
        message: "Unable to publish announcement."
      });
    }
  }
);

// DELETE ANNOUNCEMENT
app.delete(
  "/api/admin/announcements/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM app_data
         WHERE collection = $1
           AND record_id = $2`,
        ["announcements", req.params.id]
      );

      if (!result.rowCount) {
        return res.status(404).json({
          message: "Announcement not found."
        });
      }

      res.json({
        message: "Announcement deleted successfully."
      });

    } catch (error) {
      console.error("Delete announcement error:", error);

      res.status(500).json({
        message: "Unable to delete announcement."
      });
    }
  }
);


/* =========================================
   COURSES
========================================= */

// GET ACTIVE COURSES
app.get(
  "/api/courses",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY data->>'title' ASC`,
        ["courses"]
      );

      const activeCourses = result.rows
        .map(row => row.data)
        .filter(course => (course.status || "active") === "active");

      res.json({ courses: activeCourses });

    } catch (error) {
      console.error("Get courses error:", error);
      res.status(500).json({
        message: "Unable to load courses."
      });
    }
  }
);


// GET ONE ACTIVE COURSE
app.get(
  "/api/courses/:id",
  requireLogin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         LIMIT 1`,
        ["courses", req.params.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          message: "Course not found."
        });
      }

      const course = result.rows[0].data;

      if ((course.status || "active") !== "active") {
        return res.status(404).json({
          message: "Course not found."
        });
      }

      res.json({ course });

    } catch (error) {
      console.error("Get course error:", error);
      res.status(500).json({
        message: "Unable to load course."
      });
    }
  }
);


// ADMIN: GET ALL COURSES
app.get(
  "/api/admin/courses",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
         ORDER BY data->>'title' ASC`,
        ["courses"]
      );

      res.json({
        courses: result.rows.map(row => row.data)
      });

    } catch (error) {
      console.error("Admin get courses error:", error);
      res.status(500).json({
        message: "Unable to load courses."
      });
    }
  }
);


// ADMIN: CREATE COURSE
app.post(
  "/api/admin/courses",
  requireAdmin,
  async (req, res) => {
    try {
      const {
        id,
        title,
        code,
        icon,
        semester,
        description,
        topics
      } = req.body;

      if (!id || !title || !semester) {
        return res.status(400).json({
          message: "Course ID, title and semester are required."
        });
      }

      if (
        semester !== "semester-1" &&
        semester !== "semester-2"
      ) {
        return res.status(400).json({
          message: "Invalid semester."
        });
      }

      const newCourse = {
        id: id.trim(),
        title: title.trim(),
        code: code ? code.trim() : "",
        icon: icon ? icon.trim() : "📚",
        semester,
        status: "active",
        description: description ? description.trim() : "",
        topics: Array.isArray(topics) ? topics : []
      };

      await pool.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
        [
          "courses",
          newCourse.id,
          JSON.stringify(newCourse)
        ]
      );

      res.status(201).json({
        message: "Course created successfully.",
        course: newCourse
      });

    } catch (error) {
      if (error.code === "23505") {
        return res.status(409).json({
          message: "A course with this ID already exists."
        });
      }

      console.error("Create course error:", error);
      res.status(500).json({
        message: "Unable to create course."
      });
    }
  }
);


// ADMIN: DELETE COURSE
app.delete(
  "/api/admin/courses/:id",
  requireAdmin,
  async (req, res) => {
    try {
      const result = await pool.query(
        `DELETE FROM app_data
         WHERE collection = $1 AND record_id = $2
         RETURNING data`,
        ["courses", req.params.id]
      );

      if (!result.rows.length) {
        return res.status(404).json({
          message: "Course not found."
        });
      }

      res.json({
        message: "Course deleted successfully.",
        course: result.rows[0].data
      });

    } catch (error) {
      console.error("Delete course error:", error);
      res.status(500).json({
        message: "Unable to delete course."
      });
    }
  }
);


// ADMIN: UPDATE COURSE
app.put(
  "/api/admin/courses/:id",
  requireAdmin,
  async (req, res) => {
    const {
      title,
      code,
      icon,
      semester,
      description,
      topics,
      status
    } = req.body;

    if (!title || !semester) {
      return res.status(400).json({
        message: "Course title and semester are required."
      });
    }

    if (
      semester !== "semester-1" &&
      semester !== "semester-2"
    ) {
      return res.status(400).json({
        message: "Invalid semester."
      });
    }

    if (
      status &&
      status !== "active" &&
      status !== "inactive"
    ) {
      return res.status(400).json({
        message: "Invalid course status."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1 AND record_id = $2
         FOR UPDATE`,
        ["courses", req.params.id]
      );

      if (!result.rows.length) {
        await client.query("ROLLBACK");

        return res.status(404).json({
          message: "Course not found."
        });
      }

      const course = result.rows[0].data;

      course.title = title.trim();
      course.code = code ? code.trim() : "";
      course.icon = icon ? icon.trim() : "📚";
      course.semester = semester;
      course.description = description ? description.trim() : "";
      course.topics = Array.isArray(topics)
        ? topics
        : course.topics || [];
      course.status = status || course.status || "active";

      await client.query(
        `UPDATE app_data
         SET data = $1::jsonb,
             updated_at = NOW()
         WHERE collection = $2 AND record_id = $3`,
        [
          JSON.stringify(course),
          "courses",
          req.params.id
        ]
      );

      await client.query("COMMIT");

      res.json({
        message: "Course updated successfully.",
        course
      });

    } catch (error) {
      await client.query("ROLLBACK");

      console.error("Update course error:", error);

      res.status(500).json({
        message: "Unable to update course."
      });

    } finally {
      client.release();
    }
  }
);


/* =========================================
   MEMBER NOTES API — POSTGRESQL
========================================= */

// GET MEMBER NOTES
app.get("/api/notes", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT data
       FROM app_data
       WHERE collection = $1
         AND data->>'userId' = $2
       ORDER BY updated_at DESC`,
      ["notes", req.session.user.id]
    );

    res.json({
      notes: result.rows.map(row => row.data)
    });

  } catch (error) {
    console.error("Get notes error:", error);

    res.status(500).json({
      message: "Unable to load notes."
    });
  }
});


// CREATE NOTE
app.post("/api/notes", requireLogin, async (req, res) => {
  try {
    const { title, course, content } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Note title and content are required."
      });
    }

    const now = new Date().toISOString();

    const newNote = {
      id: Date.now().toString(),
      userId: req.session.user.id,
      title: title.trim(),
      course: typeof course === "string" ? course.trim() : "",
      content: content.trim(),
      createdAt: now,
      updatedAt: now
    };

    await pool.query(
      `INSERT INTO app_data
        (collection, record_id, data, created_at, updated_at)
       VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
      ["notes", newNote.id, JSON.stringify(newNote)]
    );

    res.status(201).json({
      message: "Note created successfully.",
      note: newNote
    });

  } catch (error) {
    console.error("Create note error:", error);

    res.status(500).json({
      message: "Unable to create note."
    });
  }
});


// UPDATE NOTE
app.put("/api/notes/:id", requireLogin, async (req, res) => {
  try {
    const { title, course, content } = req.body;

    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Note title and content are required."
      });
    }

    const updatedAt = new Date().toISOString();

    const result = await pool.query(
      `UPDATE app_data
       SET data = data || $1::jsonb,
           updated_at = NOW()
       WHERE collection = $2
         AND record_id = $3
         AND data->>'userId' = $4
       RETURNING data`,
      [
        JSON.stringify({
          title: title.trim(),
          course: typeof course === "string" ? course.trim() : "",
          content: content.trim(),
          updatedAt
        }),
        "notes",
        req.params.id,
        req.session.user.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Note not found."
      });
    }

    res.json({
      message: "Note updated successfully.",
      note: result.rows[0].data
    });

  } catch (error) {
    console.error("Update note error:", error);

    res.status(500).json({
      message: "Unable to update note."
    });
  }
});


// DELETE NOTE
app.delete("/api/notes/:id", requireLogin, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM app_data
       WHERE collection = $1
         AND record_id = $2
         AND data->>'userId' = $3
       RETURNING record_id`,
      [
        "notes",
        req.params.id,
        req.session.user.id
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Note not found."
      });
    }

    res.json({
      message: "Note deleted successfully."
    });

  } catch (error) {
    console.error("Delete note error:", error);

    res.status(500).json({
      message: "Unable to delete note."
    });
  }
});

/* =========================================
   CONTRIBUTIONS MODULE - POSTGRESQL
========================================= */

// MEMBER: CURRENT CONTRIBUTION
app.get("/api/contributions/me", requireLogin, async (req, res) => {
  try {
    const period = getCurrentContributionPeriod();

    const [records, settings] = await Promise.all([
      getContributions(),
      getContributionSettings()
    ]);

    const record = records.find(item =>
      item.memberId === req.session.user.id &&
      item.period === period
    );

    res.json({
      period,
      contribution: record
        ? {
            ...record,
            status: getContributionStatus(record)
          }
        : null,
      settings
    });

  } catch (error) {
    console.error("Current contribution error:", error);
    res.status(500).json({
      message: "Unable to load your contribution."
    });
  }
});


// MEMBER: CONTRIBUTION HISTORY
app.get(
  "/api/contributions/me/history",
  requireLogin,
  async (req, res) => {
    try {
      const records = await getContributions();

      const history = records
        .filter(record =>
          record.memberId === req.session.user.id
        )
        .map(record => ({
          ...record,
          status: getContributionStatus(record)
        }))
        .sort((a, b) =>
          b.period.localeCompare(a.period)
        );

      res.json({ history });

    } catch (error) {
      console.error("Contribution history error:", error);
      res.status(500).json({
        message: "Unable to load contribution history."
      });
    }
  }
);


// ADMIN: GET ALL CONTRIBUTIONS
app.get(
  "/api/admin/contributions",
  requireAdmin,
  async (req, res) => {
    try {
      const records = await getContributions();

      const period = req.query.period;
      const status = req.query.status;

      let results = records.map(record => ({
        ...record,
        status: getContributionStatus(record)
      }));

      if (period) {
        results = results.filter(record =>
          record.period === period
        );
      }

      if (status) {
        results = results.filter(record =>
          record.status === status
        );
      }

      results.sort((a, b) => {
        const periodOrder = b.period.localeCompare(a.period);

        return periodOrder ||
          a.memberName.localeCompare(b.memberName);
      });

      res.json({ contributions: results });

    } catch (error) {
      console.error("Admin contributions error:", error);
      res.status(500).json({
        message: "Unable to load contributions."
      });
    }
  }
);


// ADMIN: CONTRIBUTION SUMMARY
app.get(
  "/api/admin/contributions/summary",
  requireAdmin,
  async (req, res) => {
    try {
      const period =
        req.query.period || getCurrentContributionPeriod();

      if (!isValidContributionPeriod(period)) {
        return res.status(400).json({
          message: "Invalid contribution period."
        });
      }

      const [usersResult, records, settings] = await Promise.all([
        pool.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["users"]
        ),
        getContributions(),
        getContributionSettings()
      ]);

      const users = usersResult.rows.map(row => row.data);

      const members = users.filter(user =>
        user.roles?.includes("member") &&
        user.status !== "inactive" &&
        user.status !== "suspended"
      );

      const periodRecords = records
        .filter(record => record.period === period)
        .map(record => ({
          ...record,
          status: getContributionStatus(record)
        }));

      const paidRecords = periodRecords.filter(
        record => record.status === "paid"
      );

      const waivedRecords = periodRecords.filter(
        record => record.status === "waived"
      );

      const pendingRecords = periodRecords.filter(
        record => record.status === "pending"
      );

      const overdueRecords = periodRecords.filter(
        record => record.status === "overdue"
      );

      const monthlyAmount = Number(settings.monthlyAmount) || 0;

      const collected = paidRecords.reduce(
        (total, record) =>
          total + (Number(record.paidAmount) || 0),
        0
      );

      res.json({
        period,
        monthlyAmount,
        totalMembers: members.length,
        expectedAmount: members.length * monthlyAmount,
        collected,
        outstanding:
          (pendingRecords.length + overdueRecords.length) *
          monthlyAmount,
        paidMembers: paidRecords.length,
        pendingMembers: pendingRecords.length,
        overdueMembers: overdueRecords.length,
        waivedMembers: waivedRecords.length
      });

    } catch (error) {
      console.error("Contribution summary error:", error);
      res.status(500).json({
        message: "Unable to load contribution summary."
      });
    }
  }
);


// ADMIN: GENERATE MONTHLY CONTRIBUTION OBLIGATIONS
app.post(
  "/api/admin/contributions/generate",
  requireAdmin,
  async (req, res) => {
    const { period } = req.body;

    if (!isValidContributionPeriod(period)) {
      return res.status(400).json({
        message: "Provide a valid period, e.g. 2026-11."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Prevent two admins generating the same period simultaneously.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        [`contribution-generation-${period}`]
      );

      const [usersResult, recordsResult, settings] = await Promise.all([
        client.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["users"]
        ),
        client.query(
          `SELECT data
           FROM app_data
           WHERE collection = $1`,
          ["contributions"]
        ),
        getContributionSettings(client)
      ]);

      if (!settings.active) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Contributions are currently disabled."
        });
      }

      const users = usersResult.rows.map(row => row.data);
      const records = recordsResult.rows.map(row => row.data);

      const members = users.filter(user =>
        user.roles?.includes("member") &&
        user.status !== "inactive" &&
        user.status !== "suspended"
      );

      const existingKeys = new Set(
        records.map(record =>
          `${record.memberId}_${record.period}`
        )
      );

      const created = [];

      for (const member of members) {
        const key = `${member.id}_${period}`;

        if (existingKeys.has(key)) {
          continue;
        }

        const record = createContributionRecord(
          member,
          period,
          settings
        );

        await client.query(
          `INSERT INTO app_data
            (collection, record_id, data, created_at, updated_at)
           VALUES ($1, $2, $3::jsonb, NOW(), NOW())`,
          [
            "contributions",
            record.id,
            JSON.stringify(record)
          ]
        );

        await addContributionAudit({
          contributionId: record.id,
          action: "obligation_created",
          performedBy: req.session.user.id,
          previousValue: null,
          newValue: period
        }, client);

        created.push(record);
      }

      await client.query("COMMIT");

      res.status(201).json({
        message: `${created.length} contribution obligations generated.`,
        period,
        created: created.length,
        skipped: members.length - created.length
      });

    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Generate contributions error:", error);

      res.status(500).json({
        message: "Unable to generate contribution obligations."
      });

    } finally {
      client.release();
    }
  }
);


// ADMIN: RECORD A VERIFIED PAYMENT
app.post(
  "/api/admin/contributions/record-payment",
  requireAdmin,
  async (req, res) => {
    const {
      memberId,
      period,
      paymentDate,
      paymentReference,
      remarks
    } = req.body;

    if (
      !memberId ||
      !isValidContributionPeriod(period) ||
      !paymentDate
    ) {
      return res.status(400).json({
        message:
          "Member, valid contribution period and payment date are required."
      });
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate) ||
      Number.isNaN(Date.parse(`${paymentDate}T00:00:00`))
    ) {
      return res.status(400).json({
        message: "Invalid payment date."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const memberResult = await client.query(
        `SELECT data
         FROM app_data
         WHERE collection = $1
           AND record_id = $2
         LIMIT 1`,
        ["users", memberId]
      );

      const member = memberResult.rows[0]?.data;

      if (!member || !member.roles?.includes("member")) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: "Member not found."
        });
      }

      const settings = await getContributionSettings(client);

      const existingResult = await client.query(
        `SELECT record_id, data
         FROM app_data
         WHERE collection = $1
           AND data->>'memberId' = $2
           AND data->>'period' = $3
         LIMIT 1
         FOR UPDATE`,
        ["contributions", memberId, period]
      );

      let record = existingResult.rows[0]?.data;
      let recordId = existingResult.rows[0]?.record_id;

      if (!record) {
        record = createContributionRecord(member, period, settings);
        recordId = record.id;
      }

      if (record.status === "paid") {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "This contribution has already been recorded as paid."
        });
      }

      if (record.status === "waived") {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "This contribution has been waived."
        });
      }

      const previousValue = getContributionStatus(record);

      record.status = "paid";
      record.paidAmount = Number(settings.monthlyAmount) || 0;
      record.expectedAmount =
        Number(record.expectedAmount ?? settings.monthlyAmount) || 0;
      record.paymentDate = paymentDate;
      record.paymentReference =
        typeof paymentReference === "string"
          ? paymentReference.trim()
          : "";
      record.remarks =
        typeof remarks === "string"
          ? remarks.trim()
          : "";
      record.recordedBy = req.session.user.id;
      record.updatedAt = new Date().toISOString();

      await client.query(
        `INSERT INTO app_data
          (collection, record_id, data, created_at, updated_at)
         VALUES ($1, $2, $3::jsonb, NOW(), NOW())
         ON CONFLICT (collection, record_id)
         DO UPDATE SET
           data = EXCLUDED.data,
           updated_at = NOW()`,
        [
          "contributions",
          recordId,
          JSON.stringify(record)
        ]
      );

      await addContributionAudit({
        contributionId: record.id,
        action: "payment_recorded",
        performedBy: req.session.user.id,
        previousValue,
        newValue: "paid"
      }, client);

      await client.query("COMMIT");

      res.status(201).json({
        message: "Verified payment recorded successfully.",
        contribution: record
      });

    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Record payment error:", error);

      res.status(500).json({
        message: "Unable to record payment."
      });

    } finally {
      client.release();
    }
  }
);


// ADMIN: WAIVE A CONTRIBUTION
app.patch(
  "/api/admin/contributions/:id/waive",
  requireAdmin,
  async (req, res) => {
    const { reason } = req.body;

    if (
      typeof reason !== "string" ||
      !reason.trim()
    ) {
      return res.status(400).json({
        message: "A reason is required to waive a contribution."
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `SELECT record_id, data
         FROM app_data
         WHERE collection = $1
           AND record_id = $2
         LIMIT 1
         FOR UPDATE`,
        ["contributions", req.params.id]
      );

      if (!result.rows.length) {
        await client.query("ROLLBACK");
        return res.status(404).json({
          message: "Contribution record not found."
        });
      }

      const record = result.rows[0].data;

      if (record.status === "paid") {
        await client.query("ROLLBACK");
        return res.status(409).json({
          message: "A paid contribution cannot be waived."
        });
      }

      const previousValue = getContributionStatus(record);
      const now = new Date().toISOString();

      record.status = "waived";
      record.paidAmount = 0;
      record.waiverReason = reason.trim();
      record.waivedBy = req.session.user.id;
      record.waivedAt = now;
      record.updatedAt = now;

      await client.query(
        `UPDATE app_data
         SET data = $3::jsonb,
             updated_at = NOW()
         WHERE collection = $1
           AND record_id = $2`,
        [
          "contributions",
          req.params.id,
          JSON.stringify(record)
        ]
      );

      await addContributionAudit({
        contributionId: record.id,
        action: "contribution_waived",
        performedBy: req.session.user.id,
        previousValue,
        newValue: "waived",
        reason: reason.trim()
      }, client);

      await client.query("COMMIT");

      res.json({
        message: "Contribution waived successfully.",
        contribution: record
      });

    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      console.error("Waive contribution error:", error);

      res.status(500).json({
        message: "Unable to waive contribution."
      });

    } finally {
      client.release();
    }
  }
);


// SUPER ADMIN: VIEW CONTRIBUTION AUDIT
app.get(
  "/api/admin/contributions/audit",
  requireAdmin,
  async (req, res) => {
    if (
      !(req.session.user.roles || []).includes("super_admin")
    ) {
      return res.status(403).json({
        message: "Super administrator access required."
      });
    }

    try {
      const audit = await getContributionAudit();

      audit.sort((a, b) =>
        new Date(b.timestamp) - new Date(a.timestamp)
      );

      res.json({ audit });

    } catch (error) {
      console.error("Contribution audit error:", error);
      res.status(500).json({
        message: "Unable to load contribution audit."
      });
    }
  }
);

/* =========================================
   SERVER
========================================= */

if (process.env.NETLIFY !== "true") {
  app.listen(PORT, () => {
    console.log("The Nursing Vanguard is running at:");
    console.log(`http://localhost:${PORT}`);
  });
}

module.exports = app;