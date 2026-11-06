async function loadDashboard() {

  try {

    /* ================================
       LOAD CURRENT USER
    ================================= */

    const response =
      await fetch("/api/auth/me");


    if (!response.ok) {

      window.location.href =
        "/login.html";

      return;

    }


    const data =
      await response.json();


    const user =
      data.user;

const adminPortalLink =
  document.getElementById("adminPortalLink");

if (adminPortalLink) {
  const roles = user.roles || [];

  if (
    roles.includes("admin") ||
    roles.includes("super_admin")
  ) {
    adminPortalLink.style.display = "flex";
  }
}

    if (!user) {

      window.location.href =
        "/login.html";

      return;

    }


    const name =
      user.name || "Vanguard Member";


    const id =
      user.id || "TNV/000";


    const firstName =
      name.split(" ")[0];


    /* ================================
       USER INFORMATION
    ================================= */

    document.getElementById(
      "welcomeName"
    ).textContent =
      firstName;


    document.getElementById(
      "topUserName"
    ).textContent =
      name;


    document.getElementById(
      "topUserId"
    ).textContent =
      id;


    document.getElementById(
      "profileName"
    ).textContent =
      name;


    document.getElementById(
      "profileId"
    ).textContent =
      id;


    const initial =
      name.charAt(0).toUpperCase();


    document.getElementById(
      "userAvatar"
    ).textContent =
      initial;


    document.getElementById(
      "largeAvatar"
    ).textContent =
      initial;


    document.getElementById(
      "currentDate"
    ).textContent =
      new Date().toLocaleDateString(
        "en-NG",
        {
          weekday: "long",
          day: "numeric",
          month: "short"
        }
      );


    /* ================================
       LOAD LEARNING SUMMARY
    ================================= */

    const summaryResponse =
      await fetch(
        "/api/dashboard/learning-summary"
      );


    if (!summaryResponse.ok) {

      console.error(
        "Unable to load learning summary."
      );

      return;

    }


    const summary =
      await summaryResponse.json();


    /* ================================
       UPDATE STATS
    ================================= */

    document.getElementById(
      "streakValue"
    ).textContent =
      `${summary.streak} day${
        summary.streak === 1
          ? ""
          : "s"
      }`;


    document.getElementById(
      "xpValue"
    ).textContent =
      `${summary.xp} XP`;


    document.getElementById(
      "recordsValue"
    ).textContent =
      summary.totalRecords;


    document.getElementById(
      "profileXp"
    ).textContent =
      `${summary.xp} XP`;

const leaderboardResponse =
  await fetch("/api/leaderboard");

if (leaderboardResponse.ok) {

  const leaderboard =
    await leaderboardResponse.json();

  if (leaderboard.currentUser) {

    document.getElementById(
      "rankValue"
    ).textContent =
      `#${leaderboard.currentUser.rank}`;

  }
}

    /* ================================
       DAILY MISSION
    ================================= */

    const missionChecks =
      document.querySelectorAll(
        ".mission-check"
      );


    if (
      summary.todayCompleted &&
      missionChecks.length > 0
    ) {

      missionChecks[0].textContent =
        "✓";

      missionChecks[0].classList.add(
        "completed"
      );

    }


  } catch (error) {

    console.error(
      "Dashboard error:",
      error
    );

  }

}


/* ================================
   LOGOUT
================================ */

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async () => {

      try {

        await fetch(
          "/api/auth/logout",
          {
            method: "POST"
          }
        );


        window.location.href =
          "/login.html";


      } catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );


/* ================================
   SIDEBAR CONTROLS
================================ */

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");
const sidebarCollapseBtn = document.getElementById("sidebarCollapseBtn");
const mainContent = document.querySelector(".main-content");

// MOBILE SIDEBAR
if (menuToggle && sidebar && mobileOverlay) {

  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    mobileOverlay.classList.toggle("active");
  });

  mobileOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    mobileOverlay.classList.remove("active");
  });

  // Close sidebar after selecting a navigation link
  sidebar.querySelectorAll(".sidebar-nav .nav-item").forEach(link => {
    link.addEventListener("click", () => {
      sidebar.classList.remove("open");
      mobileOverlay.classList.remove("active");
    });
  });

}

// DESKTOP SIDEBAR COLLAPSE
if (sidebarCollapseBtn && sidebar && mainContent) {

  sidebarCollapseBtn.addEventListener("click", () => {

    sidebar.classList.toggle("collapsed");
    mainContent.classList.toggle("sidebar-collapsed");

    const isCollapsed = sidebar.classList.contains("collapsed");

    sidebarCollapseBtn.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );

    sidebarCollapseBtn.setAttribute(
      "title",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );

    sidebarCollapseBtn.textContent = isCollapsed ? "›" : "‹";

  });

}


/* =========================================
   MEMBER CONTRIBUTIONS
========================================= */

let memberContributionData = null;
let memberContributionHistory = [];


// FORMAT MONEY
function formatMemberMoney(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(amount) || 0);
}


// FORMAT PERIOD
function formatContributionPeriod(period) {
  if (!period) return "Not available";

  const [year, month] = period.split("-").map(Number);

  if (!year || !month) return period;

  return new Date(year, month - 1, 1).toLocaleDateString(
    "en-NG",
    {
      month: "long",
      year: "numeric"
    }
  );
}


// FORMAT DATE
function formatContributionDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) return date;

  return parsedDate.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}


// SAFE HTML
function escapeContributionHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


// DETERMINE DISPLAY STATUS
function getMemberContributionStatus(record, dueDay) {
  if (!record) return "pending";

  const status = String(record.status || "pending").toLowerCase();

  if (status === "paid" || status === "waived" || status === "overdue") {
    return status;
  }

  if (status === "pending" && record.period) {
    const [year, month] = record.period.split("-").map(Number);
    const dueDate = new Date(year, month - 1, Number(dueDay) || 20);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (
      year &&
      month &&
      today.getTime() > dueDate.getTime()
    ) {
      return "overdue";
    }
  }

  return status;
}


// STATUS LABEL
function contributionStatusLabel(status) {
  const labels = {
    paid: "Paid",
    pending: "Pending",
    overdue: "Overdue",
    waived: "Waived"
  };

  return labels[status] || status;
}


// LOAD MEMBER CONTRIBUTIONS
async function loadMemberContributions() {

  const historyContainer = document.getElementById(
    "memberContributionHistory"
  );

  try {

    const [currentResponse, historyResponse] = await Promise.all([
      fetch("/api/contributions/me"),
      fetch("/api/contributions/me/history")
    ]);

    if (!currentResponse.ok || !historyResponse.ok) {
      throw new Error("Unable to load contribution information.");
    }

    const currentData = await currentResponse.json();
    const historyData = await historyResponse.json();

    memberContributionData = currentData;
    memberContributionHistory = historyData.history || [];

    renderMemberContributions();

  } catch (error) {

    console.error("Member contributions error:", error);

    if (historyContainer) {
      historyContainer.innerHTML = `
        <tr>
          <td colspan="5" class="contribution-empty-state">
            Unable to load contribution history. Please refresh the page.
          </td>
        </tr>
      `;
    }

    document.getElementById(
      "memberContributionMessage"
    ).textContent = "Your contribution information could not be loaded.";

  }
}


// RENDER MEMBER CONTRIBUTIONS
function renderMemberContributions() {

  if (!memberContributionData) return;

  const { period, contribution, settings } = memberContributionData;

  const bankDetails = settings?.bankDetails || {};

  const dueDay = Number(settings?.dueDay) || 20;

  const monthlyAmount = Number(settings?.monthlyAmount) || 500;

  const history = memberContributionHistory;

  // PAYMENT SUMMARY

  const totalPaid = history.reduce(
    (total, record) => total + (Number(record.paidAmount) || 0),
    0
  );

  const totalOutstanding = history.reduce((total, record) => {

    const status = String(record.status || "").toLowerCase();

    if (status === "waived") return total;

    return total + Math.max(
      0,
      (Number(record.expectedAmount) || 0) -
      (Number(record.paidAmount) || 0)
    );

  }, 0);

  const monthsPaid = history.filter(
    record => String(record.status).toLowerCase() === "paid"
  ).length;


  document.getElementById("memberTotalPaid").textContent =
    formatMemberMoney(totalPaid);

  document.getElementById("memberTotalOutstanding").textContent =
    formatMemberMoney(totalOutstanding);

  document.getElementById("memberMonthsPaid").textContent =
    monthsPaid;


  // CURRENT CONTRIBUTION

  const currentPeriod = contribution?.period || period;

  const expectedAmount = Number(
    contribution?.expectedAmount ?? monthlyAmount
  );

  const paidAmount = Number(contribution?.paidAmount) || 0;

  const balance = Math.max(0, expectedAmount - paidAmount);

  const status = getMemberContributionStatus(contribution, dueDay);

  const statusElement = document.getElementById(
    "memberContributionStatus"
  );

  statusElement.textContent = contributionStatusLabel(status);

  statusElement.className = `contribution-status ${status}`;

  document.getElementById("memberContributionAmount").textContent =
    formatMemberMoney(expectedAmount);

  document.getElementById("memberContributionPeriod").textContent =
    formatContributionPeriod(currentPeriod);

  document.getElementById("memberContributionPaid").textContent =
    formatMemberMoney(paidAmount);

  document.getElementById("memberContributionBalance").textContent =
    formatMemberMoney(balance);


  const messageElement = document.getElementById(
    "memberContributionMessage"
  );

  if (!contribution) {

    messageElement.textContent =
      "No contribution record has been generated for this period yet.";

  } else if (status === "paid") {

    messageElement.textContent =
      "Your contribution for this period has been verified. Thank you for paying promptly.";

  } else if (status === "waived") {

    messageElement.textContent =
      "Your contribution for this period has been waived.";

  } else if (status === "overdue") {

    messageElement.textContent =
      "Your contribution is overdue. Please complete your transfer and submit proof of payment.";

  } else {

    messageElement.textContent =
      `Your monthly contribution is due on or before the ${dueDay}${dueDay === 1 ? "st" : dueDay === 2 ? "nd" : dueDay === 3 ? "rd" : "th"} of the month.`;

  }


  // PAYMENT ACCOUNT DETAILS

  document.getElementById("contributionBank").textContent =
    bankDetails.bank || "PalmPay";

  document.getElementById("contributionAccountNumber").textContent =
    bankDetails.accountNumber || "Not available";

  document.getElementById("contributionAccountName").textContent =
    bankDetails.accountName || "Not available";

  document.getElementById("contributionMonthlyAmount").textContent =
    formatMemberMoney(monthlyAmount);

  document.getElementById("contributionProofPhone").textContent =
    bankDetails.proofSubmissionPhone || "Contact the administrator";


  // CONTRIBUTION HISTORY

  renderMemberContributionHistory(history, dueDay);

}


// RENDER HISTORY TABLE
function renderMemberContributionHistory(history, dueDay) {

  const container = document.getElementById(
    "memberContributionHistory"
  );

  if (!container) return;

  if (!history.length) {

    container.innerHTML = `
      <tr>
        <td colspan="5" class="contribution-empty-state">
          You do not have any contribution records yet.
        </td>
      </tr>
    `;

    return;
  }

  const sortedHistory = [...history].sort(
    (a, b) => b.period.localeCompare(a.period)
  );

  container.innerHTML = sortedHistory.map(record => {

    const status = getMemberContributionStatus(record, dueDay);

    return `
      <tr>

        <td>
          <strong>
            ${escapeContributionHTML(
              formatContributionPeriod(record.period)
            )}
          </strong>
        </td>

        <td>
          ${formatMemberMoney(record.expectedAmount)}
        </td>

        <td>
          ${formatMemberMoney(record.paidAmount)}
        </td>

        <td>
          ${escapeContributionHTML(
            formatContributionDate(record.paymentDate)
          )}
        </td>

        <td>
          <span class="contribution-history-status ${status}">
            ${escapeContributionHTML(
              contributionStatusLabel(status)
            )}
          </span>
        </td>

      </tr>
    `;

  }).join("");

}


// COPY ACCOUNT NUMBER
const copyContributionAccountButton = document.getElementById(
  "copyContributionAccount"
);

if (copyContributionAccountButton) {

  copyContributionAccountButton.addEventListener("click", async () => {

    const accountNumber = document.getElementById(
      "contributionAccountNumber"
    ).textContent.trim();

    if (!accountNumber || accountNumber === "Not available") {
      alert("Account number is unavailable.");
      return;
    }

    try {

      await navigator.clipboard.writeText(accountNumber);

      copyContributionAccountButton.textContent = "Copied!";

      setTimeout(() => {
        copyContributionAccountButton.textContent = "Copy Account Number";
      }, 2000);

    } catch (error) {

      console.error("Copy error:", error);
      alert("Unable to copy account number. Please copy it manually.");

    }

  });

}



/* =========================================
   DASHBOARD SECTION NAVIGATION
========================================= */

const contributionsNavLink = document.getElementById(
  "contributionsNavLink"
);

const challengesNavLink = document.getElementById(
  "memberChallengesNavLink"
);

const dashboardContent = document.querySelector(".dashboard-content");

const dashboardNavLink = document.getElementById(
  "dashboardNavLink"
);

const contributionsSection = document.getElementById("contributions");
const challengesSection = document.getElementById("challenges");

if (
  dashboardContent &&
  contributionsSection &&
  challengesSection
) {

  const dashboardSections = Array.from(dashboardContent.children)
    .filter(element =>
      element.id !== "contributions" &&
      element.id !== "challenges"
    );

  function showDashboardSection(section) {

    const showDashboard = section === "dashboard";
    const showContributions = section === "contributions";
    const showChallenges = section === "challenges";

    // Main dashboard content
    dashboardSections.forEach(element => {
      element.style.display = showDashboard ? "" : "none";
    });

    // Contributions section
    contributionsSection.style.display =
      showContributions ? "block" : "none";

    contributionsSection.classList.toggle(
      "active",
      showContributions
    );

    // Challenges section
    challengesSection.style.display =
      showChallenges ? "block" : "none";

    // Sidebar active states
    contributionsNavLink?.classList.toggle(
      "active",
      showContributions
    );

    challengesNavLink?.classList.toggle(
      "active",
      showChallenges
    );

    dashboardNavLink?.classList.toggle(
      "active",
      showDashboard
    );

    // Load selected section
    if (showContributions) {
      loadMemberContributions();
    }

    if (showChallenges) {
      loadMemberChallenges();
    }

  }

  // Dashboard navigation
  dashboardNavLink?.addEventListener("click", event => {
    event.preventDefault();
    showDashboardSection("dashboard");
  });

  // Contributions navigation
  contributionsNavLink?.addEventListener("click", event => {
    event.preventDefault();
    showDashboardSection("contributions");
  });

  // Challenges navigation
  challengesNavLink?.addEventListener("click", event => {
    event.preventDefault();
    showDashboardSection("challenges");
  });

}

/* =========================================
   MEMBER CHALLENGES
========================================= */

let memberChallenges = [];


// SAFE HTML

function escapeChallengeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);

}


// LOAD CHALLENGES

async function loadMemberChallenges() {

  const container = document.getElementById(
    "memberChallengesContainer"
  );

  const message = document.getElementById(
    "memberChallengeMessage"
  );

  if (!container || !message) return;

  message.textContent = "Loading challenges...";

  try {

    const response = await fetch("/api/challenges");

    if (!response.ok) {
      throw new Error("Unable to retrieve challenges.");
    }

    const data = await response.json();

    memberChallenges = data.challenges || [];

    renderMemberChallenges();

    message.textContent = memberChallenges.length
      ? "Choose a challenge and start making progress."
      : "There are no published challenges available right now.";

  } catch (error) {

    console.error("Member challenges error:", error);

    message.textContent =
      "Unable to load challenges. Please refresh and try again.";

    container.innerHTML = `
      <div class="dashboard-card">
        Unable to load challenges. Please try again later.
      </div>
    `;

  }

}


// RENDER CHALLENGES

function renderMemberChallenges() {

  const container = document.getElementById(
    "memberChallengesContainer"
  );

  if (!container) return;

  const activeCount = memberChallenges.filter(
    challenge => challenge.progress === "in_progress"
  ).length;

  const completedCount = memberChallenges.filter(
    challenge => challenge.progress === "completed"
  ).length;

  document.getElementById(
    "memberAvailableChallenges"
  ).textContent = memberChallenges.length;

  document.getElementById(
    "memberActiveChallenges"
  ).textContent = activeCount;

  document.getElementById(
    "memberCompletedChallenges"
  ).textContent = completedCount;


  if (!memberChallenges.length) {

    container.innerHTML = `
      <div class="dashboard-card">
        <h3>No challenges available</h3>
        <p>Published challenges will appear here when they are released.</p>
      </div>
    `;

    return;

  }


  container.innerHTML = memberChallenges.map(challenge => {

    const progress = challenge.progress || "not_started";

    let buttonHTML = "";

    if (progress === "completed") {

      buttonHTML = `
        <button type="button" class="secondary-btn" disabled>
          ✓ Challenge Completed
        </button>
      `;

    } else if (progress === "in_progress") {

      buttonHTML = `
        <button
          type="button"
          class="primary-btn"
          data-challenge-action="complete"
          data-challenge-id="${escapeChallengeHTML(challenge.id)}"
        >
          Mark as Completed →
        </button>
      `;

    } else {

      buttonHTML = `
        <button
          type="button"
          class="primary-btn"
          data-challenge-action="start"
          data-challenge-id="${escapeChallengeHTML(challenge.id)}"
        >
          Start Challenge →
        </button>
      `;

    }

    return `
      <div class="dashboard-card member-challenge-card">

        <div class="card-header">
          <span class="section-label">
            ${escapeChallengeHTML(challenge.category)}
          </span>

          <span class="contribution-status ${progress}">
            ${progress === "not_started"
              ? "Not Started"
              : progress === "in_progress"
                ? "In Progress"
                : "Completed"}
          </span>
        </div>

        <h3>${escapeChallengeHTML(challenge.title)}</h3>

        <p>${escapeChallengeHTML(challenge.description)}</p>

        <div class="contribution-detail-row">
          <span>Challenge Type</span>
          <strong>${escapeChallengeHTML(challenge.type)}</strong>
        </div>

        <div class="contribution-detail-row">
          <span>XP Reward</span>
          <strong>⭐ ${Number(challenge.xpReward) || 0} XP</strong>
        </div>

        <div class="contribution-detail-row">
          <span>Start Date</span>
          <strong>${escapeChallengeHTML(challenge.startDate)}</strong>
        </div>

        <div class="contribution-detail-row">
          <span>End Date</span>
          <strong>${escapeChallengeHTML(challenge.endDate)}</strong>
        </div>

        ${buttonHTML}

      </div>
    `;

  }).join("");

}


// START OR COMPLETE CHALLENGE

async function handleMemberChallengeAction(action, challengeId) {

  const message = document.getElementById(
    "memberChallengeMessage"
  );

  try {

    const endpoint = action === "start"
      ? `/api/challenges/${encodeURIComponent(challengeId)}/start`
      : `/api/challenges/${encodeURIComponent(challengeId)}/complete`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Challenge action failed."
      );
    }

    if (action === "complete") {

      message.textContent =
        `Congratulations! You earned ${result.earnedXp} XP.`;

      // Refresh the dashboard XP display.
      const xpElement = document.getElementById("xpValue");
      const profileXp = document.getElementById("profileXp");

      if (xpElement) {
        xpElement.textContent = `${result.totalXp} XP`;
      }

      if (profileXp) {
        profileXp.textContent = `${result.totalXp} XP`;
      }

    } else {

      message.textContent =
        "Challenge started! Complete the task and mark it as completed when you are done.";

    }

    await loadMemberChallenges();

  } catch (error) {

    console.error("Challenge action error:", error);

    message.textContent = error.message;

  }

}


// CHALLENGE BUTTON EVENTS

const memberChallengesContainer = document.getElementById(
  "memberChallengesContainer"
);

if (memberChallengesContainer) {

  memberChallengesContainer.addEventListener("click", event => {

    const button = event.target.closest(
      "[data-challenge-action]"
    );

    if (!button) return;

    const action = button.dataset.challengeAction;
    const challengeId = button.dataset.challengeId;

    if (!action || !challengeId) return;

    handleMemberChallengeAction(action, challengeId);

  });

}


/* =========================================
   NOTIFICATION CENTRE
========================================= */

const notificationBtn = document.getElementById("notificationBtn");
const notificationDropdown = document.getElementById("notificationDropdown");
const notificationCount = document.getElementById("notificationCount");
const notificationSummary = document.getElementById("notificationSummary");
const notificationList = document.getElementById("notificationList");
const markAllNotificationsRead = document.getElementById("markAllNotificationsRead");


/* LOAD NOTIFICATIONS */

async function loadNotifications() {

  if (!notificationList) return;

  try {

    const response = await fetch("/api/notifications");

    if (!response.ok) {
      throw new Error("Unable to load notifications.");
    }

    const data = await response.json();

    const notifications = data.notifications || [];
    const unreadCount = data.unreadCount || 0;

    // Update unread badge
    if (notificationCount) {
      notificationCount.textContent = unreadCount;
      notificationCount.style.display =
        unreadCount > 0 ? "flex" : "none";
    }

    // Update summary
    if (notificationSummary) {
      notificationSummary.textContent =
        unreadCount > 0
          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
          : "You're all caught up.";
    }

    // Clear previous notifications
    notificationList.innerHTML = "";

    // Empty state
    if (notifications.length === 0) {

      notificationList.innerHTML = `
        <div class="notification-empty">
          You're all caught up. No notifications yet.
        </div>
      `;

      return;
    }

    // Display notifications
    notifications.forEach(notification => {

      const item = document.createElement("button");

      item.type = "button";
      item.className = "notification-item";

      if (!notification.read) {
        item.classList.add("unread");
      }

      const content = document.createElement("div");
      content.className = "notification-item-content";

      const title = document.createElement("strong");
      title.className = "notification-item-title";
      title.textContent = notification.title;

      const message = document.createElement("p");
      message.className = "notification-item-message";
      message.textContent = notification.message;

      const time = document.createElement("small");
      time.className = "notification-item-time";

      const date = new Date(notification.createdAt);

      time.textContent = isNaN(date.getTime())
        ? ""
        : date.toLocaleString("en-NG", {
            dateStyle: "medium",
            timeStyle: "short"
          });

      content.appendChild(title);
      content.appendChild(message);
      content.appendChild(time);

      item.appendChild(content);

      item.addEventListener("click", async () => {

        await markNotificationAsRead(notification.id);

        window.location.href =
          notification.link || "/dashboard.html";

      });

      notificationList.appendChild(item);

    });

  } catch (error) {

    console.error("Notification error:", error);

    notificationList.innerHTML = `
      <div class="notification-empty">
        Unable to load notifications. Please try again.
      </div>
    `;

  }

}


/* MARK ONE NOTIFICATION AS READ */

async function markNotificationAsRead(notificationId) {

  try {

    const response = await fetch(
      `/api/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: "PATCH"
      }
    );

    if (!response.ok) {
      throw new Error("Unable to update notification.");
    }

    await loadNotifications();

  } catch (error) {

    console.error("Mark notification read error:", error);

  }

}


/* MARK ALL NOTIFICATIONS AS READ */

if (markAllNotificationsRead) {

  markAllNotificationsRead.addEventListener("click", async () => {

    try {

      const response = await fetch(
        "/api/notifications/read-all",
        {
          method: "PATCH"
        }
      );

      if (!response.ok) {
        throw new Error("Unable to mark notifications as read.");
      }

      await loadNotifications();

    } catch (error) {

      console.error("Mark all notifications error:", error);

    }

  });

}


/* TOGGLE NOTIFICATION DROPDOWN */

if (notificationBtn && notificationDropdown) {

  notificationBtn.addEventListener("click", () => {

    const isOpen =
      notificationDropdown.style.display !== "none";

    notificationDropdown.style.display =
      isOpen ? "none" : "block";

    notificationBtn.setAttribute(
      "aria-expanded",
      String(!isOpen)
    );

    if (!isOpen) {
      loadNotifications();
    }

  });


  // Close dropdown when clicking outside

  document.addEventListener("click", (event) => {

    const wrapper = document.querySelector(".notification-wrapper");

    if (
      wrapper &&
      !wrapper.contains(event.target)
    ) {

      notificationDropdown.style.display = "none";

      notificationBtn.setAttribute(
        "aria-expanded",
        "false"
      );

    }

  });

}


/* INITIAL NOTIFICATION LOAD */

loadNotifications();

/* ================================
   START DASHBOARD
================================ */

loadDashboard();