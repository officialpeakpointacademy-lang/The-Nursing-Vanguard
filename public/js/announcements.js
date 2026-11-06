document.addEventListener("DOMContentLoaded", async () => {
  const announcementsList =
    document.getElementById("announcementsList");

  const announcementsLoading =
    document.getElementById("announcementsLoading");

  const announcementsEmpty =
    document.getElementById("announcementsEmpty");

  const announcementsNoResults =
    document.getElementById("announcementsNoResults");

  const announcementSearch =
    document.getElementById("announcementSearch");

  const announcementCategory =
    document.getElementById("announcementCategory");

  let announcements = [];


  /* =========================================
     AUTHENTICATION
  ========================================= */

  try {
    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      window.location.href = "/login.html";
      return;
    }

    const data = await response.json();

    const user = data.user;

    if (user) {
      const topUserName =
        document.getElementById("topUserName");

      const topUserId =
        document.getElementById("topUserId");

      const userAvatar =
        document.getElementById("userAvatar");

      if (topUserName) {
        topUserName.textContent = user.name;
      }

      if (topUserId) {
        topUserId.textContent = user.id;
      }

      if (userAvatar) {
        const initials = user.name
          .split(" ")
          .map(name => name.charAt(0))
          .join("")
          .substring(0, 2)
          .toUpperCase();

        userAvatar.textContent = initials;
      }
    }

  } catch (error) {
    console.error(
      "Authentication check failed:",
      error
    );

    window.location.href = "/login.html";
    return;
  }


  /* =========================================
     LOAD ANNOUNCEMENTS
  ========================================= */

  async function loadAnnouncements() {
    try {
      const response =
        await fetch("/api/announcements");

      if (!response.ok) {
        throw new Error(
          "Unable to load announcements."
        );
      }

      const data = await response.json();

      announcements = data.announcements || [];

      announcementsLoading.style.display = "none";

      if (announcements.length === 0) {
        announcementsEmpty.style.display = "block";
        return;
      }

      renderAnnouncements();

    } catch (error) {
      console.error(
        "Failed to load announcements:",
        error
      );

      announcementsLoading.style.display = "none";

      announcementsEmpty.style.display = "block";

      announcementsEmpty.querySelector("h3")
        .textContent =
        "Unable to load announcements.";

      announcementsEmpty.querySelector("p")
        .textContent =
        "Please refresh the page and try again.";
    }
  }


  /* =========================================
     RENDER ANNOUNCEMENTS
  ========================================= */

  function renderAnnouncements() {
    const searchTerm =
      announcementSearch.value
        .trim()
        .toLowerCase();

    const selectedCategory =
      announcementCategory.value;

    const filteredAnnouncements =
      announcements.filter(announcement => {

        const matchesCategory =
          selectedCategory === "all" ||
          announcement.category === selectedCategory;

        const searchableText =
          `${announcement.title}
          ${announcement.content}
          ${announcement.category}
          ${announcement.author}`
            .toLowerCase();

        const matchesSearch =
          searchableText.includes(searchTerm);

        return matchesCategory && matchesSearch;
      });


    announcementsList.innerHTML = "";


    if (filteredAnnouncements.length === 0) {
      announcementsNoResults.style.display = "block";
      return;
    }


    announcementsNoResults.style.display = "none";


    filteredAnnouncements.forEach(
      announcement => {

        const card =
          document.createElement("article");

        card.className =
          `announcement-card category-${announcement.category.toLowerCase()}`;


        const categoryClass =
          getCategoryClass(
            announcement.category
          );


        card.innerHTML = `
          <div class="announcement-card-header">

            <span class="announcement-category ${categoryClass}">
              ${escapeHtml(announcement.category)}
            </span>

            <span class="announcement-date">
              ${formatDate(announcement.createdAt)}
            </span>

          </div>

          <h3>
            ${escapeHtml(announcement.title)}
          </h3>

          <p class="announcement-content">
            ${escapeHtml(announcement.content)}
          </p>

          <div class="announcement-card-footer">

            <span>
              Posted by
              <strong>
                ${escapeHtml(announcement.author)}
              </strong>
            </span>

          </div>
        `;

        announcementsList.appendChild(card);
      }
    );
  }


  /* =========================================
     CATEGORY CLASS
  ========================================= */

  function getCategoryClass(category) {

    switch (category) {

      case "Important":
        return "category-important";

      case "Academic":
        return "category-academic";

      case "Assessment":
        return "category-assessment";

      case "Event":
        return "category-event";

      default:
        return "category-general";
    }
  }


  /* =========================================
     DATE FORMAT
  ========================================= */

  function formatDate(dateString) {

    const date = new Date(dateString);

    return new Intl.DateTimeFormat(
      "en-NG",
      {
        day: "numeric",
        month: "short",
        year: "numeric"
      }
    ).format(date);
  }


  /* =========================================
     ESCAPE HTML
  ========================================= */

  function escapeHtml(value) {

    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  /* =========================================
     SEARCH
  ========================================= */

  announcementSearch.addEventListener(
    "input",
    renderAnnouncements
  );


  /* =========================================
     CATEGORY FILTER
  ========================================= */

  announcementCategory.addEventListener(
    "change",
    renderAnnouncements
  );


  /* =========================================
     LOGOUT
  ========================================= */

  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {

    logoutButton.addEventListener(
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
            "Logout failed:",
            error
          );

        }
      }
    );
  }


  /* =========================================
     MOBILE MENU
  ========================================= */

  const menuToggle =
    document.getElementById("menuToggle");

  const sidebar =
    document.querySelector(".sidebar");

  if (menuToggle && sidebar) {

    menuToggle.addEventListener(
      "click",
      () => {
        sidebar.classList.toggle("open");
      }
    );
  }


  /* =========================================
     CLOSE MOBILE SIDEBAR
  ========================================= */

  const navItems =
    document.querySelectorAll(".nav-item");

  navItems.forEach(item => {

    item.addEventListener(
      "click",
      () => {

        if (sidebar) {
          sidebar.classList.remove("open");
        }

      }
    );

  });


  /* =========================================
     START
  ========================================= */

  await loadAnnouncements();

});