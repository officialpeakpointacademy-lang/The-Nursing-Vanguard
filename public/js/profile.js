async function loadProfile() {

  try {

    /* CHECK LOGIN */
    const authResponse =
      await fetch("/api/auth/me");

    if (!authResponse.ok) {
      window.location.href =
        "/login.html";
      return;
    }


    const authData =
      await authResponse.json();

    const user =
      authData.user;


    if (!user) {
      window.location.href =
        "/login.html";
      return;
    }


    /* BASIC USER INFORMATION */

    const name =
      user.name || "Vanguard Member";

    const id =
      user.id || "TNV/000";

    const initial =
      name.charAt(0).toUpperCase();


    document.getElementById(
      "topUserName"
    ).textContent = name;


    document.getElementById(
      "topUserId"
    ).textContent = id;


    document.getElementById(
      "profileName"
    ).textContent = name;


    document.getElementById(
      "profileId"
    ).textContent = id;


    document.getElementById(
      "userAvatar"
    ).textContent = initial;


    document.getElementById(
      "largeAvatar"
    ).textContent = initial;


    /* LOAD PROFILE DATA */

    const profileResponse =
      await fetch("/api/profile");


    if (!profileResponse.ok) {

      console.error(
        "Unable to load profile."
      );

      return;

    }


    const profileData =
      await profileResponse.json();


    const profile =
      profileData.profile;


    /* STATS */

    document.getElementById(
      "rankValue"
    ).textContent =
      `#${profile.rank}`;


    document.getElementById(
      "xpValue"
    ).textContent =
      `${profile.xp} XP`;


    document.getElementById(
      "streakValue"
    ).textContent =
      `${profile.streak} day${
        profile.streak === 1
          ? ""
          : "s"
      }`;


    document.getElementById(
      "recordsValue"
    ).textContent =
      profile.totalRecords;


    /* RECENT RECORDS */

    const recordsContainer =
      document.getElementById(
        "profileRecords"
      );


    const records =
      profile.recentRecords || [];


    if (records.length === 0) {

      recordsContainer.innerHTML = `
        <div class="profile-empty-state">
          You haven't submitted any learning records yet.
        </div>
      `;

      return;

    }


    recordsContainer.innerHTML =
      records
        .map(
          (record) => `

            <article class="profile-record-card">

              <div class="profile-record-top">

                <div>

                  <span class="profile-record-day">
                    ${escapeHtml(record.day)}
                  </span>

                  <h3>
                    ${escapeHtml(record.course)}
                  </h3>

                </div>

                <span class="profile-record-date">
                  ${formatDate(record.date)}
                </span>

              </div>


              <div class="profile-record-lecturer">

                <strong>
                  Lecturer:
                </strong>

                ${escapeHtml(record.lecturer)}

              </div>


              <div class="profile-record-learned">

                <strong>
                  What I learned
                </strong>

                <p>
                  ${escapeHtml(record.learned)}
                </p>

              </div>


              ${
                record.takeaway
                  ? `

                    <div class="profile-record-takeaway">

                      <strong>
                        Key Takeaway
                      </strong>

                      <p>
                        ${escapeHtml(
                          record.takeaway
                        )}
                      </p>

                    </div>

                  `
                  : ""
              }

            </article>

          `
        )
        .join("");


  } catch (error) {

    console.error(
      "Profile error:",
      error
    );

  }

}


/* ESCAPE HTML */

function escapeHtml(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* FORMAT DATE */

function formatDate(dateString) {

  const date =
    new Date(
      `${dateString}T00:00:00`
    );

  return date.toLocaleDateString(
    "en-NG",
    {
      day: "numeric",
      month: "short",
      year: "numeric"
    }
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

      } catch (error) {

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

loadProfile();