/* =========================================
   COURSES PAGE
========================================= */

/* LOAD COURSES FROM API */

let allCourses = [];

async function loadCourses() {
  try {
    const response = await fetch("/api/courses");

    if (!response.ok) {
      throw new Error("Unable to load courses.");
    }

    const data = await response.json();

    allCourses = data.courses || [];

    renderCourses("semester-1");

    console.log(
      "Courses loaded:",
      allCourses.length
    );

  } catch (error) {
    console.error(
      "Course loading error:",
      error
    );
  }
}

function renderCourses(semester) {
  const courseGrid =
    document.getElementById("courseGrid");

  if (!courseGrid) {
    console.error("Course grid not found.");
    return;
  }

  const filteredCourses =
    allCourses.filter(
      course =>
        course.semester === semester
    );

  courseGrid.innerHTML =
    filteredCourses
      .map(
        course => `
          <article class="course-card">

            <div class="course-card-top">

              <div class="course-icon">
                ${course.icon || "📚"}
              </div>

              <span class="course-code">
                ${course.code || "COURSE"}
              </span>

            </div>

            <h3>
              ${course.title}
            </h3>

            <p>
              ${course.description}
            </p>

            <div class="course-card-footer">

              <span class="course-status">
                Active
              </span>

              <a
                href="/course.html?course=${course.id}"
                class="course-btn"
              >
                View Course
              </a>

            </div>

          </article>
        `
      )
      .join("");

  console.log(
    `Rendered ${filteredCourses.length} courses for ${semester}`
  );
}

const semesterSelect =
  document.getElementById("semesterSelect");

if (semesterSelect) {
  semesterSelect.addEventListener(
    "change",
    () => {
      renderCourses(
        semesterSelect.value
      );
    }
  );
}

/* CHECK LOGIN */

async function loadCoursesPage() {

  try {

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

    if (!user) {

      window.location.href =
        "/login.html";

      return;

    }


    /* USER INFORMATION */

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
      "userAvatar"
    ).textContent = initial;


  } catch (error) {

    console.error(
      "Courses page error:",
      error
    );

  }

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

loadCoursesPage();
loadCourses();