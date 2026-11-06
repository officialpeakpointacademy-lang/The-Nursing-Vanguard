/* =========================================
   COURSE DETAIL PAGE
========================================= */

/* =========================================
   CHECK LOGIN + LOAD COURSE
========================================= */

async function loadCoursePage() {

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



    /* GET COURSE FROM URL */

    const params =
      new URLSearchParams(
        window.location.search
      );


    const courseId =
      params.get("course");


    let course = null;

try {

  const courseResponse =
    await fetch(
      `/api/courses/${courseId}`
    );

  if (courseResponse.ok) {

    const courseData =
      await courseResponse.json();

    course =
      courseData.course;

  }

} catch (error) {

  console.error(
    "Unable to load course from API:",
    error
  );

}


    /* INVALID COURSE */

    if (!course) {

      document.getElementById(
        "courseTitle"
      ).textContent =
        "Course Not Found";


      document.getElementById(
        "courseDescription"
      ).textContent =
        "The course you are looking for does not exist.";


      document.getElementById(
        "courseIcon"
      ).textContent = "⚠️";


      document.getElementById(
        "courseCode"
      ).textContent = "ERROR";


      document.title =
        "Course Not Found | The Nursing Vanguard";


      return;

    }



    /* LOAD COURSE INFORMATION */

    document.getElementById(
      "courseTitle"
    ).textContent =
      course.title;


    document.getElementById(
      "courseCode"
    ).textContent =
      course.code || "Course Code Not Assigned";


    document.getElementById(
      "courseIcon"
    ).textContent =
      course.icon;


    document.getElementById(
      "courseDescription"
    ).textContent =
      course.description;


    document.getElementById(
      "pageTitle"
    ).textContent =
      course.title;

/* LOAD COURSE TOPICS */

const topicsContainer =
  document.getElementById("courseTopics");


if (topicsContainer) {

  topicsContainer.innerHTML =
    course.topics
      .map(
        (topic, index) => `
          <div class="course-topic-item">

            <span class="course-topic-number">
              ${index + 1}
            </span>

            <span class="course-topic-name">
              ${topic}
            </span>

          </div>
        `
      )
      .join("");

}

    document.title =
      `${course.title} | The Nursing Vanguard`;

  } catch (error) {

    console.error(
      "Course page error:",
      error
    );

  }

}



/* =========================================
   LOGOUT
========================================= */

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



/* =========================================
   MOBILE MENU
========================================= */

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



/* =========================================
   START
========================================= */

loadCoursePage();