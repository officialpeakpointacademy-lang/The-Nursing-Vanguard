async function loadLeaderboard() {

  try {

    const meResponse =
      await fetch("/api/auth/me");

    if (!meResponse.ok) {
      window.location.href =
        "/login.html";

      return;
    }

    const meData =
      await meResponse.json();

    const user =
      meData.user;

    if (!user) {
      window.location.href =
        "/login.html";

      return;
    }


    // USER INFORMATION

    const name =
      user.name ||
      "Vanguard Member";

    const id =
      user.id ||
      "TNV/000";

    const initial =
      name
        .charAt(0)
        .toUpperCase();


    document.getElementById(
      "topUserName"
    ).textContent =
      name;


    document.getElementById(
      "topUserId"
    ).textContent =
      id;


    document.getElementById(
      "userAvatar"
    ).textContent =
      initial;


    // LOAD LEADERBOARD

    const response =
      await fetch(
        "/api/leaderboard"
      );


    if (!response.ok) {

      throw new Error(
        "Unable to load leaderboard."
      );

    }


    const data =
      await response.json();


    const currentUser =
      data.currentUser;


    // CURRENT USER

    if (currentUser) {

      document.getElementById(
        "currentRank"
      ).textContent =
        `#${currentUser.rank}`;


      document.getElementById(
        "currentXp"
      ).textContent =
        `${currentUser.xp} XP`;


      document.getElementById(
        "currentStreak"
      ).textContent =
        `${currentUser.streak} day${
          currentUser.streak === 1
            ? ""
            : "s"
        }`;

    }


    // LEADERBOARD

    const list =
      document.getElementById(
        "leaderboardList"
      );


    list.innerHTML = "";


    data.leaderboard.forEach(
      (member) => {

        const row =
          document.createElement(
            "div"
          );


        row.className =
          "leaderboard-row";


        if (
          currentUser &&
          member.id === currentUser.id
        ) {

          row.classList.add(
            "current-member"
          );

        }


        let rankDisplay =
          `#${member.rank}`;


        if (member.rank === 1) {
          rankDisplay = "🥇";
        }

        else if (member.rank === 2) {
          rankDisplay = "🥈";
        }

        else if (member.rank === 3) {
          rankDisplay = "🥉";
        }


        const memberInitial =
          member.name
            .charAt(0)
            .toUpperCase();


        row.innerHTML = `

          <div class="leaderboard-rank">
            ${rankDisplay}
          </div>

          <div class="leaderboard-avatar">
            ${memberInitial}
          </div>

          <div class="leaderboard-member">

            <strong>
              ${escapeHtml(
                member.name
              )}
            </strong>

            <span>
              ${member.id}
            </span>

          </div>

          <div class="leaderboard-streak">
            🔥 ${member.streak}
          </div>

          <div class="leaderboard-xp">
            ${member.xp} XP
          </div>

        `;


        list.appendChild(row);

      }
    );


  } catch (error) {

    console.error(
      "Leaderboard error:",
      error
    );


    document.getElementById(
      "leaderboardList"
    ).innerHTML = `

      <div class="empty-state">

        <strong>
          Unable to load leaderboard
        </strong>

        <p>
          Please refresh the page and
          try again.
        </p>

      </div>

    `;

  }

}


/* ESCAPE HTML */

function escapeHtml(value) {

  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );

}


/* LOGOUT */

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

      }

      catch (error) {

        console.error(
          "Logout error:",
          error
        );

      }

    }
  );


/* MOBILE MENU */

const menuToggle =
  document.getElementById(
    "menuToggle"
  );

const sidebar =
  document.getElementById(
    "sidebar"
  );

const mobileOverlay =
  document.getElementById(
    "mobileOverlay"
  );


menuToggle.addEventListener(
  "click",
  () => {

    sidebar.classList.toggle(
      "open"
    );

    mobileOverlay.classList.toggle(
      "active"
    );

  }
);


mobileOverlay.addEventListener(
  "click",
  () => {

    sidebar.classList.remove(
      "open"
    );

    mobileOverlay.classList.remove(
      "active"
    );

  }
);


/* START */

loadLeaderboard();