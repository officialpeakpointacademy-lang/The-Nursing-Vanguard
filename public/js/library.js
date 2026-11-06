document.addEventListener("DOMContentLoaded", async () => {
  const librarySearch = document.getElementById("librarySearch");
  const libraryCards = Array.from(
    document.querySelectorAll(".library-card")
  );

  const noResults = document.getElementById("libraryNoResults");

  /* =========================================
     AUTH CHECK
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
    console.error("Authentication check failed:", error);
    window.location.href = "/login.html";
    return;
  }

  /* =========================================
     LIBRARY SEARCH
  ========================================= */

  function filterLibrary() {
    const searchTerm =
      librarySearch?.value.trim().toLowerCase() || "";

    let visibleCards = 0;

    libraryCards.forEach(card => {
      const title =
        card.querySelector("h3")?.textContent.toLowerCase() || "";

      const description =
        card.querySelector("p")?.textContent.toLowerCase() || "";

      const tag =
        card.querySelector(".library-card-tag")
          ?.textContent.toLowerCase() || "";

      const category =
        card.dataset.category?.toLowerCase() || "";

      const matches =
        title.includes(searchTerm) ||
        description.includes(searchTerm) ||
        tag.includes(searchTerm) ||
        category.includes(searchTerm);

      if (matches) {
        card.style.display = "";
        visibleCards++;
      } else {
        card.style.display = "none";
      }
    });

    if (noResults) {
      noResults.style.display =
        visibleCards === 0 ? "block" : "none";
    }
  }

  if (librarySearch) {
    librarySearch.addEventListener(
      "input",
      filterLibrary
    );
  }

  /* =========================================
     LOGOUT
  ========================================= */

  const logoutButton =
    document.getElementById("logoutButton");

  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      try {
        await fetch("/api/auth/logout", {
          method: "POST"
        });

        window.location.href = "/login.html";
      } catch (error) {
        console.error("Logout failed:", error);
      }
    });
  }

  /* =========================================
     MOBILE MENU
  ========================================= */

  const menuToggle =
    document.getElementById("menuToggle");

  const sidebar =
    document.querySelector(".sidebar");

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }

  /* =========================================
     CLOSE SIDEBAR AFTER NAVIGATION
  ========================================= */

  const navItems =
    document.querySelectorAll(".nav-item");

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      if (sidebar) {
        sidebar.classList.remove("open");
      }
    });
  });
});