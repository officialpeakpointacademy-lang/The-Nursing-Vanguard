/* =========================================
   ADMIN DASHBOARD
========================================= */

const adminName =
  document.getElementById("adminName");

const adminAvatar =
  document.getElementById("adminAvatar");

const totalMembers =
  document.getElementById("totalMembers");

const activeToday =
  document.getElementById("activeToday");

const learningRecords =
  document.getElementById("learningRecords");

const announcementCount =
  document.getElementById("announcementCount");

const membersContainer =
  document.getElementById("membersContainer");

const logoutBtn =
  document.getElementById("logoutBtn");

  const announcementForm =
  document.getElementById("announcementForm");

const announcementTitle =
  document.getElementById("announcementTitle");

const announcementCategory =
  document.getElementById("announcementCategory");

const announcementContent =
  document.getElementById("announcementContent");

const publishAnnouncementBtn =
  document.getElementById(
    "publishAnnouncementBtn"
  );

const announcementFormMessage =
  document.getElementById(
    "announcementFormMessage"
  );

const adminAnnouncementsContainer =
  document.getElementById(
    "adminAnnouncementsContainer"
  );

  const learningSearch =
  document.getElementById(
    "learningSearch"
  );

const learningCourseFilter =
  document.getElementById(
    "learningCourseFilter"
  );

const adminLearningCount =
  document.getElementById(
    "adminLearningCount"
  );

const adminLearningContainer =
  document.getElementById(
    "adminLearningContainer"
  );

  let adminLearningRecords = [];

  /* =========================================
   COURSE MANAGEMENT ELEMENTS
========================================= */

const adminCoursesContainer =
  document.getElementById("adminCoursesContainer");

const adminCourseCount =
  document.getElementById("adminCourseCount");

const adminActiveCourseCount =
  document.getElementById("adminActiveCourseCount");

const adminInactiveCourseCount =
  document.getElementById("adminInactiveCourseCount");

const adminCourseResultCount =
  document.getElementById("adminCourseResultCount");

const courseSearch =
  document.getElementById("courseSearch");

const adminSemesterFilter =
  document.getElementById("adminSemesterFilter");

const adminCourseStatusFilter =
  document.getElementById("adminCourseStatusFilter");

const adminCourseForm =
  document.getElementById("adminCourseForm");

const addCourseBtn =
  document.getElementById("addCourseBtn");

const cancelCourseBtn =
  document.getElementById("cancelCourseBtn");

const courseFormHeading =
  document.getElementById("courseFormHeading");

const courseOriginalId =
  document.getElementById("courseOriginalId");

const courseId =
  document.getElementById("courseId");

const courseTitle =
  document.getElementById("courseTitle");

const courseCode =
  document.getElementById("courseCode");

const courseIcon =
  document.getElementById("courseIcon");

const courseSemester =
  document.getElementById("courseSemester");

const courseStatus =
  document.getElementById("courseStatus");

const courseDescription =
  document.getElementById("courseDescription");

const courseTopics =
  document.getElementById("courseTopics");

const saveCourseBtn =
  document.getElementById("saveCourseBtn");

const adminCourseMessage =
  document.getElementById("adminCourseMessage");

let adminCourses = [];

/* =========================================
   CHALLENGE MANAGEMENT ELEMENTS
========================================= */

const adminChallengesContainer =
  document.getElementById("adminChallengesContainer");

const adminChallengeCount =
  document.getElementById("adminChallengeCount");

const adminPublishedChallengeCount =
  document.getElementById("adminPublishedChallengeCount");

const adminDraftChallengeCount =
  document.getElementById("adminDraftChallengeCount");

const adminCompletedChallengeCount =
  document.getElementById("adminCompletedChallengeCount");

const adminChallengeMessage =
  document.getElementById("adminChallengeMessage");

const adminChallengeForm =
  document.getElementById("adminChallengeForm");

const addChallengeBtn =
  document.getElementById("addChallengeBtn");

const cancelChallengeBtn =
  document.getElementById("cancelChallengeBtn");

const challengeFormHeading =
  document.getElementById("challengeFormHeading");

const challengeOriginalId =
  document.getElementById("challengeOriginalId");

const challengeTitle =
  document.getElementById("challengeTitle");

const challengeCategory =
  document.getElementById("challengeCategory");

const challengeType =
  document.getElementById("challengeType");

const challengeXP =
  document.getElementById("challengeXP");

const challengeStartDate =
  document.getElementById("challengeStartDate");

const challengeEndDate =
  document.getElementById("challengeEndDate");

const challengeDescription =
  document.getElementById("challengeDescription");

const saveChallengeBtn =
  document.getElementById("saveChallengeBtn");

const challengeSearch =
  document.getElementById("challengeSearch");

const challengeStatusFilter =
  document.getElementById("challengeStatusFilter");

const challengeCategoryFilter =
  document.getElementById("challengeCategoryFilter");

const challengeResultCount = document.getElementById("adminChallengeResultCount");
let adminChallenges = [];

/* =========================================
   LOAD ADMIN
========================================= */

async function loadAdmin() {

  try {

    const response =
      await fetch("/api/auth/me");

    const data =
      await response.json();

    if (
      !response.ok ||
      !data.user
    ) {

      window.location.href =
        "/login.html";

      return;
    }


    const roles =
      data.user.roles || [];


    if (
      !roles.includes("admin") &&
      !roles.includes("super_admin")
    ) {

      window.location.href =
        "/member";

      return;
    }


    adminName.textContent =
      data.user.name;


    const firstLetter =
      data.user.name
        .charAt(0)
        .toUpperCase();

    adminAvatar.textContent =
      firstLetter;

  } catch (error) {

    console.error(
      "Unable to load admin:",
      error
    );

    window.location.href =
      "/login.html";
  }
}


/* =========================================
   LOAD STATISTICS
========================================= */

async function loadStats() {

  try {

    const response =
      await fetch(
        "/api/admin/stats"
      );

    const data =
      await response.json();


    if (!response.ok) {

      console.error(
        "Unable to load statistics:",
        data.message
      );

      return;
    }


    totalMembers.textContent =
      data.members ?? 0;

    activeToday.textContent =
      data.activeToday ?? 0;

    learningRecords.textContent =
      data.learningRecords ?? 0;


  } catch (error) {

    console.error(
      "Statistics error:",
      error
    );

  }
}


/* =========================================
   LOAD ANNOUNCEMENT COUNT
========================================= */

async function loadAnnouncementCount() {

  try {

    const response =
      await fetch(
        "/api/announcements"
      );

    const data =
      await response.json();


    if (!response.ok) {

      announcementCount.textContent =
        "0";

      return;
    }


    announcementCount.textContent =
      (data.announcements || []).length;


  } catch (error) {

    console.error(
      "Announcement count error:",
      error
    );

    announcementCount.textContent =
      "0";
  }
}


/* =========================================
   LOAD MEMBERS
========================================= */

async function loadMembers() {

  try {

    membersContainer.innerHTML = `
      <div class="admin-loading">
        Loading members...
      </div>
    `;


    const response =
      await fetch(
        "/api/members"
      );

    const members =
      await response.json();


    if (!response.ok) {

      membersContainer.innerHTML = `
        <div class="admin-empty">
          Unable to load members.
        </div>
      `;

      return;
    }


    if (!members.length) {

      membersContainer.innerHTML = `
        <div class="admin-empty">
          No members found.
        </div>
      `;

      return;
    }


    membersContainer.innerHTML = `

      <div class="admin-table-wrapper">

        <table class="admin-table">

          <thead>

            <tr>

              <th>
                Vanguard ID
              </th>

              <th>
                Member
              </th>

              <th>
                Role
              </th>

              <th>
                XP
              </th>

              <th>
                Streak
              </th>

            </tr>

          </thead>

          <tbody>

            ${members.map(member => {

              const roles =
                (member.roles || [])
                  .join(", ");

              return `

                <tr>

                  <td>
                    <strong>
                      ${escapeHtml(member.id)}
                    </strong>
                  </td>

                  <td>
                    ${escapeHtml(member.name)}
                  </td>

                  <td>
                    ${escapeHtml(roles)}
                  </td>

                  <td>
                    ${member.xp || 0}
                  </td>

                  <td>
                    ${member.streak || 0}
                  </td>

                </tr>

              `;

            }).join("")}

          </tbody>

        </table>

      </div>

    `;


  } catch (error) {

    console.error(
      "Members error:",
      error
    );

    membersContainer.innerHTML = `
      <div class="admin-empty">
        Unable to load members.
      </div>
    `;
  }
}

async function loadAdminAnnouncements() {
  try {

    adminAnnouncementsContainer.innerHTML = `
      <div class="admin-loading">
        Loading announcements...
      </div>
    `;

    const response =
      await fetch(
        "/api/announcements"
      );

    const data =
      await response.json();

    if (!response.ok) {
      adminAnnouncementsContainer.innerHTML = `
        <div class="admin-announcements-empty">
          Unable to load announcements.
        </div>
      `;
      return;
    }

    const announcements =
      data.announcements || [];

    if (!announcements.length) {
      adminAnnouncementsContainer.innerHTML = `
        <div class="admin-announcements-empty">
          No announcements have been published yet.
        </div>
      `;
      return;
    }

    adminAnnouncementsContainer.innerHTML =
      announcements.map(
        announcement => {

          const createdDate =
            new Date(
              announcement.createdAt
            ).toLocaleDateString(
              "en-NG",
              {
                day: "numeric",
                month: "short",
                year: "numeric"
              }
            );

          return `
            <article
              class="admin-announcement-card"
            >

              <div
                class="admin-announcement-card-header"
              >

                <div>

                  <h4>
                    ${escapeHtml(
                      announcement.title
                    )}
                  </h4>

                  <div
                    class="admin-announcement-meta"
                  >

                    <span
                      class="admin-announcement-category"
                    >
                      ${escapeHtml(
                        announcement.category
                      )}
                    </span>

                    <span>
                      ${createdDate}
                    </span>

                    <span>
                      By ${escapeHtml(
                        announcement.author
                      )}
                    </span>

                  </div>

                </div>


                <button
                  type="button"
                  class="admin-announcement-delete"
                  data-id="${escapeHtml(
                    announcement.id
                  )}"
                >
                  Delete
                </button>

              </div>


              <p
                class="admin-announcement-content"
              >
                ${escapeHtml(
                  announcement.content
                )}
              </p>

            </article>
          `;
        }
      ).join("");

    const deleteButtons =
      document.querySelectorAll(
        ".admin-announcement-delete"
      );

    deleteButtons.forEach(
      button => {

        button.addEventListener(
          "click",
          () => {
            deleteAnnouncement(
              button.dataset.id
            );
          }
        );

      }
    );

  } catch (error) {

    console.error(
      "Announcements error:",
      error
    );

    adminAnnouncementsContainer.innerHTML = `
      <div class="admin-announcements-empty">
        Unable to load announcements.
      </div>
    `;
  }
}

async function publishAnnouncement(event) {

  event.preventDefault();

  const title =
    announcementTitle.value.trim();

  const category =
    announcementCategory.value;

  const content =
    announcementContent.value.trim();


  if (
    !title ||
    !category ||
    !content
  ) {

    showAnnouncementMessage(
      "Please complete all announcement fields.",
      "error"
    );

    return;
  }


  publishAnnouncementBtn.disabled =
    true;

  publishAnnouncementBtn.textContent =
    "Publishing...";


  try {

    const response =
      await fetch(
        "/api/admin/announcements",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            title,
            category,
            content
          })
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      showAnnouncementMessage(
        data.message ||
          "Unable to publish announcement.",
        "error"
      );

      return;
    }


    showAnnouncementMessage(
      "Announcement published successfully.",
      "success"
    );


    announcementForm.reset();


    await loadAdminAnnouncements();

    await loadAnnouncementCount();


  } catch (error) {

    console.error(
      "Publish announcement error:",
      error
    );

    showAnnouncementMessage(
      "Something went wrong while publishing the announcement.",
      "error"
    );

  } finally {

    publishAnnouncementBtn.disabled =
      false;

    publishAnnouncementBtn.textContent =
      "Publish Announcement";
  }
}

function showAnnouncementMessage(
  message,
  type
) {

  announcementFormMessage.textContent =
    message;

  announcementFormMessage.className =
    `admin-form-message ${type}`;

}

async function deleteAnnouncement(
  announcementId
) {

  const confirmed =
    window.confirm(
      "Are you sure you want to delete this announcement?"
    );

  if (!confirmed) {
    return;
  }


  try {

    const response =
      await fetch(
        `/api/admin/announcements/${announcementId}`,
        {
          method: "DELETE"
        }
      );


    const data =
      await response.json();


    if (!response.ok) {

      window.alert(
        data.message ||
          "Unable to delete announcement."
      );

      return;
    }


    await loadAdminAnnouncements();

    await loadAnnouncementCount();


  } catch (error) {

    console.error(
      "Delete announcement error:",
      error
    );

    window.alert(
      "Something went wrong while deleting the announcement."
    );
  }
}

async function loadAdminLearningRecords() {

  try {

    adminLearningContainer.innerHTML = `
      <div class="admin-loading">
        Loading learning records...
      </div>
    `;

    const response =
      await fetch(
        "/api/admin/learning-records"
      );

    const data =
      await response.json();

    if (!response.ok) {

      adminLearningContainer.innerHTML = `
        <div class="admin-empty">
          Unable to load learning records.
        </div>
      `;

      return;
    }

    adminLearningRecords =
      data.records || [];

    populateLearningCourseFilter();

    renderAdminLearningRecords();

  } catch (error) {

    console.error(
      "Learning records error:",
      error
    );

    adminLearningContainer.innerHTML = `
      <div class="admin-empty">
        Unable to load learning records.
      </div>
    `;
  }
}

function populateLearningCourseFilter() {

  const courses =
    [
      ...new Set(
        adminLearningRecords
          .map(record => record.course)
          .filter(Boolean)
      )
    ]
    .sort();

  learningCourseFilter.innerHTML = `
    <option value="">
      All Courses
    </option>

    ${courses.map(course => `
      <option value="${escapeHtml(course)}">
        ${escapeHtml(course)}
      </option>
    `).join("")}
  `;
}

function renderAdminLearningRecords() {

  const search =
    learningSearch.value
      .trim()
      .toLowerCase();

  const selectedCourse =
    learningCourseFilter.value;


  const filteredRecords =
    adminLearningRecords.filter(
      record => {

        const userName =
          String(record.userName || "")
            .toLowerCase();

        const userId =
          String(record.userId || "")
            .toLowerCase();

        const course =
          String(record.course || "")
            .toLowerCase();

        const matchesSearch =
          !search ||
          userName.includes(search) ||
          userId.includes(search) ||
          course.includes(search);

        const matchesCourse =
          !selectedCourse ||
          record.course === selectedCourse;

        return (
          matchesSearch &&
          matchesCourse
        );
      }
    );


  adminLearningCount.textContent =
    filteredRecords.length;


  if (!filteredRecords.length) {

    adminLearningContainer.innerHTML = `
      <div class="admin-learning-empty">

        <h3>
          No learning records found
        </h3>

        <p>
          Try changing your search or
          course filter.
        </p>

      </div>
    `;

    return;
  }


  adminLearningContainer.innerHTML =
    filteredRecords
      .map(record => {

        const formattedDate =
          new Date(
            record.date + "T00:00:00"
          ).toLocaleDateString(
            "en-NG",
            {
              day: "numeric",
              month: "short",
              year: "numeric"
            }
          );


        return `
          <article
            class="admin-learning-card"
          >

            <div
              class="admin-learning-card-header"
            >

              <div>

                <h3>
                  ${escapeHtml(
                    record.userName
                  )}
                </h3>

                <span
                  class="admin-learning-id"
                >
                  ${escapeHtml(
                    record.userId
                  )}
                </span>

              </div>


              <span
                class="admin-learning-date"
              >
                ${formattedDate}
              </span>

            </div>


            <div
              class="admin-learning-meta"
            >

              <span>
                ${escapeHtml(
                  record.day
                )}
              </span>

              <span>•</span>

              <strong>
                ${escapeHtml(
                  record.course
                )}
              </strong>

              <span>•</span>

              <span>
                Lecturer:
                ${escapeHtml(
                  record.lecturer
                )}
              </span>

            </div>


            <div
              class="admin-learning-content"
            >

              <div>

                <span
                  class="admin-learning-label"
                >
                  What was learned
                </span>

                <p>
                  ${escapeHtml(
                    record.learned
                  )}
                </p>

              </div>


              ${
                record.takeaway
                  ? `
                    <div>

                      <span
                        class="admin-learning-label"
                      >
                        Takeaway
                      </span>

                      <p>
                        ${escapeHtml(
                          record.takeaway
                        )}
                      </p>

                    </div>
                  `
                  : ""
              }

            </div>

          </article>
        `;
      })
      .join("");
}

/* =========================================
   COURSE MANAGEMENT
========================================= */

async function loadAdminCourses() {

  try {

    adminCoursesContainer.innerHTML = `
      <div class="admin-loading">
        Loading courses...
      </div>
    `;

    const response =
      await fetch("/api/admin/courses");

    const data =
      await response.json();

    if (!response.ok) {

      adminCoursesContainer.innerHTML = `
        <div class="admin-empty">
          Unable to load courses.
        </div>
      `;

      return;
    }

    adminCourses = data.courses || [];

    updateAdminCourseStats();

    renderAdminCourses();

  } catch (error) {

    console.error(
      "Course loading error:",
      error
    );

    adminCoursesContainer.innerHTML = `
      <div class="admin-empty">
        Unable to load courses.
      </div>
    `;

  }
}


/* =========================================
   COURSE STATISTICS
========================================= */

function updateAdminCourseStats() {

  const activeCourses =
    adminCourses.filter(
      course => course.status === "active"
    );

  const inactiveCourses =
    adminCourses.filter(
      course => course.status !== "active"
    );

  adminCourseCount.textContent =
    adminCourses.length;

  adminActiveCourseCount.textContent =
    activeCourses.length;

  adminInactiveCourseCount.textContent =
    inactiveCourses.length;

}


/* =========================================
   RENDER COURSES
========================================= */

function renderAdminCourses() {

  const search =
    courseSearch.value.trim().toLowerCase();

  const semester =
    adminSemesterFilter.value;

  const status =
    adminCourseStatusFilter.value;

  const filteredCourses =
    adminCourses.filter(course => {

      const matchesSearch =
        !search ||
        course.title.toLowerCase().includes(search) ||
        (course.code || "").toLowerCase().includes(search);

      const matchesSemester =
        !semester ||
        course.semester === semester;

      const matchesStatus =
        !status ||
        (course.status || "active") === status;

      return (
        matchesSearch &&
        matchesSemester &&
        matchesStatus
      );

    });

  adminCourseResultCount.textContent =
    `${filteredCourses.length} courses`;

  if (!filteredCourses.length) {

    adminCoursesContainer.innerHTML = `
      <div class="admin-empty">
        No courses match your search.
      </div>
    `;

    return;
  }

  adminCoursesContainer.innerHTML =
    filteredCourses.map(course => {

      const courseStatus =
        course.status || "active";

      return `
        <article class="admin-course-card">

          <div class="admin-course-card-main">

            <div class="admin-course-icon">
              ${escapeHtml(course.icon || "📚")}
            </div>

            <div class="admin-course-info">

              <h3>
                ${escapeHtml(course.title)}
              </h3>

              <p>
                ${escapeHtml(course.code || "No course code")}
              </p>

              <span>
                ${course.semester === "semester-1"
                  ? "Semester 1"
                  : "Semester 2"}
              </span>

            </div>

          </div>

          <div class="admin-course-card-details">

            <p>
              ${escapeHtml(course.description || "No description provided.")}
            </p>

            <span class="admin-course-status ${courseStatus}">
              ${courseStatus}
            </span>

            <span>
              ${(course.topics || []).length} topics
            </span>

          </div>

        <div class="admin-course-card-actions">

  <button
    type="button"
    class="admin-course-edit"
    data-id="${escapeHtml(course.id)}"
  >
    Edit
  </button>

  <button
    type="button"
    class="admin-course-toggle"
    data-id="${escapeHtml(course.id)}"
  >
    ${courseStatus === "active" ? "Deactivate" : "Activate"}
  </button>

  <button
    type="button"
    class="admin-course-delete"
    data-id="${escapeHtml(course.id)}"
  >
    Delete
  </button>

</div>

        </article>
      `;

    }).join("");

    adminCoursesContainer
  .querySelectorAll(".admin-course-toggle")
  .forEach(button => {

    button.addEventListener("click", () => {
      toggleAdminCourse(button.dataset.id);
    });

  });
  
      document.querySelectorAll(
    ".admin-course-topics"
  ).forEach(button => {

    button.addEventListener("click", () => {
      manageCourseTopics(button.dataset.id);
    });

  });
}

/* =========================================
   MULTILINE COURSE TOPIC MANAGER
========================================= */

async function manageCourseTopics(courseId) {

  const course = adminCourses.find(
    item => item.id === courseId
  );

  if (!course) {
    window.alert("Course not found.");
    return;
  }

  // Remove an existing editor if one is open
  document.getElementById("topicEditorModal")?.remove();

  // Create editor
  const modal = document.createElement("div");

  modal.id = "topicEditorModal";
  modal.className = "topic-editor-overlay";

  modal.innerHTML = `
    <div class="topic-editor-modal">

      <div class="topic-editor-header">
        <div>
          <h2>Manage Course Topics</h2>
          <p>${escapeHtml(course.title)}</p>
        </div>

        <button
          type="button"
          id="closeTopicEditor"
          class="topic-editor-close"
        >
          &times;
        </button>
      </div>

      <div class="topic-editor-body">

        <label for="topicEditorInput">
          Course Topics
        </label>

        <textarea
          id="topicEditorInput"
          rows="12"
          placeholder="Enter one topic per line..."
        ></textarea>

        <small>
          Enter each topic on a separate line.
          Each non-empty line becomes one topic.
        </small>

        <div class="topic-editor-count">
          <span id="topicEditorCount">0 topics</span>
        </div>

      </div>

      <div class="topic-editor-actions">

        <button
          type="button"
          id="cancelTopicEditor"
          class="btn btn-secondary"
        >
          Cancel
        </button>

        <button
          type="button"
          id="saveTopicEditor"
          class="btn btn-primary"
        >
          Save Topics
        </button>

      </div>

    </div>
  `;

  document.body.appendChild(modal);

  const textarea =
    document.getElementById("topicEditorInput");

  const count =
    document.getElementById("topicEditorCount");

  const saveBtn =
    document.getElementById("saveTopicEditor");

  // Load existing topics on separate lines
  textarea.value =
    (course.topics || []).join("\n");

  function updateTopicCount() {

    const total = textarea.value
      .split("\n")
      .map(topic => topic.trim())
      .filter(Boolean).length;

    count.textContent =
      `${total} topic${total === 1 ? "" : "s"}`;
  }

  updateTopicCount();

  textarea.addEventListener(
    "input",
    updateTopicCount
  );

  function closeEditor() {
    modal.remove();
  }

  document.getElementById(
    "closeTopicEditor"
  ).addEventListener("click", closeEditor);

  document.getElementById(
    "cancelTopicEditor"
  ).addEventListener("click", closeEditor);

  // Save topics
  saveBtn.addEventListener("click", async () => {

    const topics = textarea.value
      .split("\n")
      .map(topic => topic.trim())
      .filter(Boolean);

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";

    try {

      const response = await fetch(
        `/api/admin/courses/${encodeURIComponent(courseId)}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            title: course.title,
            code: course.code || "",
            icon: course.icon || "📚",
            semester: course.semester,
            description: course.description || "",
            status: course.status || "active",
            topics
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        window.alert(
          data.message || "Unable to save topics."
        );

        return;
      }

      closeEditor();

      await loadAdminCourses();

      showCourseMessage(
        "Course topics updated successfully!",
        "success"
      );

    } catch (error) {

      console.error(
        "Topic management error:",
        error
      );

      window.alert(
        "Something went wrong while saving topics."
      );

    } finally {

      saveBtn.disabled = false;
      saveBtn.textContent = "Save Topics";

    }

  });

  textarea.focus();
}
/* =========================================
   ACTIVATE / DEACTIVATE COURSE
========================================= */

async function toggleAdminCourse(courseId) {

  const course = adminCourses.find(
    item => item.id === courseId
  );

  if (!course) {
    window.alert("Course not found.");
    return;
  }

  const newStatus =
    course.status === "active"
      ? "inactive"
      : "active";

  const action =
    newStatus === "active"
      ? "activate"
      : "deactivate";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} ${course.title}?`
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
      `/api/admin/courses/${encodeURIComponent(courseId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: course.title,
          code: course.code || "",
          icon: course.icon || "📚",
          semester: course.semester,
          description: course.description || "",
          topics: course.topics || [],
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      window.alert(
        data.message || "Unable to update course status."
      );
      return;
    }

    await loadAdminCourses();

    showCourseMessage(
      `${course.title} has been ${action}d successfully.`,
      "success"
    );

  } catch (error) {

    console.error("Course status error:", error);

    window.alert(
      "Something went wrong while updating course status."
    );

  }
}

/* =========================================
   EDIT EXISTING COURSE
========================================= */

function editAdminCourse(courseIdentifier) {

  const course = adminCourses.find(
    item => item.id === courseIdentifier
  );

  if (!course) {
    showCourseMessage(
      "Course not found.",
      "error"
    );
    return;
  }

  adminCourseForm.reset();

  courseOriginalId.value = course.id;

  courseId.value = course.id;
  courseTitle.value = course.title;
  courseCode.value = course.code || "";
  courseIcon.value = course.icon || "";
  courseSemester.value = course.semester;
  courseStatus.value = course.status || "active";
  courseDescription.value = course.description || "";

  courseTopics.value =
    (course.topics || []).join("\n");

  courseId.disabled = true;

  courseFormHeading.textContent =
    "Edit Course";

  saveCourseBtn.textContent =
    "Update Course";

  adminCourseForm.hidden = false;

  adminCourseForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}

/* =========================================
   COURSE ACTION BUTTONS
========================================= */

adminCoursesContainer.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(".admin-course-edit");

    const deleteButton =
      event.target.closest(".admin-course-delete");

    if (editButton) {
      editAdminCourse(editButton.dataset.id);
    }

    if (deleteButton) {
      deleteAdminCourse(deleteButton.dataset.id);
    }

  }
);

/* =========================================
   DELETE COURSE
========================================= */

async function deleteAdminCourse(courseId) {

  const course = adminCourses.find(
    item => item.id === courseId
  );

  if (!course) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete ${course.title}?`
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
      `/api/admin/courses/${encodeURIComponent(courseId)}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      showCourseMessage(
        data.message || "Unable to delete course.",
        "error"
      );
      return;
    }

    showCourseMessage(
      "Course deleted successfully!",
      "success"
    );

    await loadAdminCourses();

  } catch (error) {

    console.error("Delete course error:", error);

    showCourseMessage(
      "Something went wrong while deleting the course.",
      "error"
    );

  }

}

/* =========================================
   COURSE SEARCH AND FILTERS
========================================= */

courseSearch.addEventListener(
  "input",
  renderAdminCourses
);

adminSemesterFilter.addEventListener(
  "change",
  renderAdminCourses
);

adminCourseStatusFilter.addEventListener(
  "change",
  renderAdminCourses
);


/* =========================================
   OPEN ADD COURSE FORM
========================================= */

addCourseBtn.addEventListener(
  "click",
  () => {

    adminCourseForm.reset();

    courseOriginalId.value = "";

    courseId.disabled = false;

    courseFormHeading.textContent =
      "Add New Course";

    saveCourseBtn.textContent =
      "Save Course";

    adminCourseForm.hidden = false;

    adminCourseForm.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

  }
);


/* =========================================
   CLOSE COURSE FORM
========================================= */

cancelCourseBtn.addEventListener(
  "click",
  () => {

    adminCourseForm.reset();

    adminCourseForm.hidden = true;

    courseOriginalId.value = "";

    courseId.disabled = false;

    adminCourseMessage.textContent = "";

  }
);

/* =========================================
   CREATE AND UPDATE COURSES
========================================= */

async function createAdminCourse(event) {

  event.preventDefault();

  const originalId =
    courseOriginalId.value.trim();

  const id =
    courseId.value.trim();

  const title =
    courseTitle.value.trim();

  const code =
    courseCode.value.trim();

  const icon =
    courseIcon.value.trim();

  const semester =
    courseSemester.value;

  const status =
    courseStatus.value;

  const description =
    courseDescription.value.trim();

  const topics =
    courseTopics.value
      .split("\n")
      .map(topic => topic.trim())
      .filter(Boolean);


  if (!id || !title || !semester) {

    showCourseMessage(
      "Please complete all required fields.",
      "error"
    );

    return;
  }


  const isEditing = Boolean(originalId);

  const method = isEditing ? "PUT" : "POST";

  const url = isEditing
    ? `/api/admin/courses/${encodeURIComponent(originalId)}`
    : "/api/admin/courses";


  saveCourseBtn.disabled = true;

  saveCourseBtn.textContent =
    isEditing ? "Updating Course..." : "Saving Course...";


  try {

    const response = await fetch(
      url,
      {
        method,

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          id,
          title,
          code,
          icon,
          semester,
          status,
          description,
          topics
        })
      }
    );


    const data = await response.json();


    if (!response.ok) {

      showCourseMessage(
        data.message || "Unable to save course.",
        "error"
      );

      return;
    }


    showCourseMessage(
      isEditing
        ? "Course updated successfully!"
        : "Course created successfully!",
      "success"
    );


    adminCourseForm.reset();

    adminCourseForm.hidden = true;

    courseOriginalId.value = "";

    courseId.disabled = false;


    await loadAdminCourses();


  } catch (error) {

    console.error(
      "Course save error:",
      error
    );

    showCourseMessage(
      "Something went wrong while saving the course.",
      "error"
    );

  } finally {

    saveCourseBtn.disabled = false;

    saveCourseBtn.textContent =
      "Save Course";

  }

}

/* =========================================
   COURSE FORM MESSAGE
========================================= */

function showCourseMessage(message, type) {

  adminCourseMessage.textContent = message;

  adminCourseMessage.className =
    `admin-form-message ${type}`;

}

/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================
   CONTRIBUTIONS MANAGEMENT
========================================= */

const contributionPeriod =
  document.getElementById("contributionPeriod");

const generateContributionsBtn =
  document.getElementById("generateContributionsBtn");

const contributionExpected =
  document.getElementById("contributionExpected");

const contributionCollected =
  document.getElementById("contributionCollected");

const contributionOutstanding =
  document.getElementById("contributionOutstanding");

const contributionPaidCount =
  document.getElementById("contributionPaidCount");

const contributionSearch =
  document.getElementById("contributionSearch");

const contributionStatusFilter =
  document.getElementById("contributionStatusFilter");

const contributionResultCount =
  document.getElementById("contributionResultCount");

const contributionsContainer =
  document.getElementById("contributionsContainer");

const contributionMessage =
  document.getElementById("contributionMessage");

let adminContributions = [];


/* =========================================
   CONTRIBUTION HELPERS
========================================= */

function formatContributionMoney(amount) {

  return Number(amount || 0).toLocaleString(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0
    }
  );

}


function showContributionMessage(message, type = "success") {

  contributionMessage.textContent = message;

  contributionMessage.className =
    `admin-form-message ${type}`;

}


/* =========================================
   LOAD CONTRIBUTION SUMMARY
========================================= */

async function loadContributionSummary() {

  const period = contributionPeriod.value;

  if (!period) return;

  try {

    const response = await fetch(
      `/api/admin/contributions/summary?period=${encodeURIComponent(period)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load contribution summary."
      );
    }

    contributionExpected.textContent =
      formatContributionMoney(data.expectedAmount);

    contributionCollected.textContent =
      formatContributionMoney(data.collected);

    contributionOutstanding.textContent =
      formatContributionMoney(data.outstanding);

    contributionPaidCount.textContent =
      data.paidMembers ?? 0;

  } catch (error) {

    console.error("Contribution summary error:", error);

    showContributionMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================
   LOAD CONTRIBUTION REGISTER
========================================= */

async function loadAdminContributions() {

  const period = contributionPeriod.value;

  if (!period) return;

  contributionsContainer.innerHTML = `
    <div class="admin-loading">
      Loading contribution records...
    </div>
  `;

  try {

    const response = await fetch(
      `/api/admin/contributions?period=${encodeURIComponent(period)}`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load contributions."
      );
    }

    adminContributions =
      data.contributions || [];

    await loadContributionSummary();

    renderAdminContributions();

  } catch (error) {

    console.error("Contribution loading error:", error);

    contributionsContainer.innerHTML = `
      <div class="admin-empty">
        Unable to load contribution records.
      </div>
    `;

    showContributionMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================
   RENDER CONTRIBUTION REGISTER
========================================= */

function renderAdminContributions() {

  const search =
    contributionSearch.value.trim().toLowerCase();

  const selectedStatus =
    contributionStatusFilter.value;

  const filteredRecords =
    adminContributions.filter(record => {

      const memberName =
        String(record.memberName || record.name || "")
          .toLowerCase();

      const memberId =
        String(record.memberId || "")
          .toLowerCase();

      const matchesSearch =
        !search ||
        memberName.includes(search) ||
        memberId.includes(search);

      const matchesStatus =
        !selectedStatus ||
        record.status === selectedStatus;

      return matchesSearch && matchesStatus;

    });


  contributionResultCount.textContent =
    `${filteredRecords.length} members`;


  if (!filteredRecords.length) {

    contributionsContainer.innerHTML = `
      <div class="admin-empty">
        No contribution records match your search.
      </div>
    `;

    return;

  }


  contributionsContainer.innerHTML = `

    <div class="admin-table-wrapper">

      <table class="admin-table">

        <thead>

          <tr>
            <th>Member</th>
            <th>Vanguard ID</th>
            <th>Expected</th>
            <th>Paid</th>
            <th>Status</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          ${filteredRecords.map(record => {

            const status =
              record.status || "pending";

            const memberName =
              record.memberName ||
              record.name ||
              "Unknown Member";

            const memberId =
              record.memberId || "";

            const expected =
              record.expectedAmount ?? 500;

            const paid =
              record.paidAmount ?? 0;

            return `

              <tr>

                <td>
                  <strong>
                    ${escapeHtml(memberName)}
                  </strong>
                </td>

                <td>
                  ${escapeHtml(memberId)}
                </td>

                <td>
                  ${formatContributionMoney(expected)}
                </td>

                <td>
                  ${formatContributionMoney(paid)}
                </td>

                <td>
                  <span class="admin-course-status ${escapeHtml(status)}">
                    ${escapeHtml(status.toUpperCase())}
                  </span>
                </td>

                <td>
                  ${
                    status !== "paid" &&
                    status !== "waived"
                      ? `
                        <button
                          type="button"
                          class="btn btn-primary contribution-record-payment"
                          data-id="${escapeHtml(record.id)}"
                        >
                          Record Payment
                        </button>

                        <button
                          type="button"
                          class="btn btn-secondary contribution-waive"
                          data-id="${escapeHtml(record.id)}"
                        >
                          Waive
                        </button>
                      `
                      : status === "paid"
                        ? "Completed"
                        : "Waived"
                  }
                </td>

              </tr>

            `;

          }).join("")}

        </tbody>

      </table>

    </div>

  `;

}


/* =========================================
   GENERATE MONTHLY CONTRIBUTIONS
========================================= */

async function generateMonthlyContributions() {

  const period = contributionPeriod.value;

  if (!period) {
    showContributionMessage(
      "Please select a contribution month.",
      "error"
    );
    return;
  }

  const confirmed = window.confirm(
    `Generate contribution records for ${period}?`
  );

  if (!confirmed) return;

  generateContributionsBtn.disabled = true;

  generateContributionsBtn.textContent =
    "Generating...";

  try {

    const response = await fetch(
      "/api/admin/contributions/generate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({ period })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to generate records."
      );
    }

    showContributionMessage(
      data.message || "Contribution records generated successfully.",
      "success"
    );

    await loadAdminContributions();

  } catch (error) {

    console.error("Generate contributions error:", error);

    showContributionMessage(
      error.message,
      "error"
    );

  } finally {

    generateContributionsBtn.disabled = false;

    generateContributionsBtn.textContent =
      "Generate Monthly Records";

  }

}



/* =========================================
   PAYMENT VERIFICATION MODAL
========================================= */

const paymentModal = document.getElementById("paymentModal");
const paymentForm = document.getElementById("paymentVerificationForm");

let selectedContribution = null;


// LOCAL DATE FORMAT
function getLocalDateString() {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


// OPEN MODAL
function recordContributionPayment(recordId) {

  const record = adminContributions.find(
    item => item.id === recordId
  );

  if (!record) {
    alert("Contribution record not found.");
    return;
  }

  selectedContribution = record;

  document.getElementById("paymentMemberName").textContent =
    record.memberName || record.name || "Unknown Member";

  document.getElementById("paymentMemberId").textContent =
    record.memberId || "";

  document.getElementById("paymentMemberAvatar").textContent =
    (record.memberName || "M").charAt(0).toUpperCase();

  document.getElementById("paymentMemberPeriod").textContent =
    record.period || "";

  document.getElementById("paymentAmountDue").textContent =
    formatContributionMoney(record.expectedAmount || 0);

  document.getElementById("paymentDate").value =
    getLocalDateString();

  document.getElementById("paymentReference").value = "";

  document.getElementById("paymentRemarks").value = "";

  paymentModal.classList.add("active");
  paymentModal.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";

  document.getElementById("paymentDate").focus();
}


// CLOSE MODAL
function closePaymentModal() {

  paymentModal.classList.remove("active");
  paymentModal.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  selectedContribution = null;

  paymentForm.reset();
}


// CLOSE BUTTONS
document.getElementById("closePaymentModal")
  .addEventListener("click", closePaymentModal);

document.getElementById("cancelPaymentModal")
  .addEventListener("click", closePaymentModal);


// CLOSE WHEN BACKDROP IS CLICKED
paymentModal.addEventListener("click", function(event) {

  if (event.target.hasAttribute("data-close-payment-modal")) {
    closePaymentModal();
  }

});


// CLOSE WITH ESCAPE KEY
document.addEventListener("keydown", function(event) {

  if (
    event.key === "Escape" &&
    paymentModal.classList.contains("active")
  ) {
    closePaymentModal();
  }

});


// SUBMIT PAYMENT
paymentForm.addEventListener("submit", async function(event) {

  event.preventDefault();

  if (!selectedContribution) {
    alert("Please select a contribution record.");
    return;
  }

  const confirmButton =
    document.getElementById("confirmPaymentBtn");

  const paymentDate =
    document.getElementById("paymentDate").value;

  const paymentReference =
    document.getElementById("paymentReference").value.trim();

  const remarks =
    document.getElementById("paymentRemarks").value.trim();

  if (!paymentDate) {
    alert("Please select the payment date.");
    return;
  }

  const originalText = confirmButton.textContent;

  confirmButton.disabled = true;
  confirmButton.textContent = "Recording Payment...";

  try {

    const response = await fetch(
      "/api/admin/contributions/record-payment",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          memberId: selectedContribution.memberId,
          period: selectedContribution.period,
          paymentDate,
          paymentReference,
          remarks
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to record payment."
      );
    }

    closePaymentModal();

    showContributionMessage(
      data.message || "Payment successfully recorded.",
      "success"
    );

    await loadAdminContributions();

  } catch (error) {

    alert(error.message);

  } finally {

    confirmButton.disabled = false;
    confirmButton.textContent = originalText;

  }

});


/* =========================================
   WAIVE CONTRIBUTION
========================================= */

async function waiveContribution(recordId) {

  const record = adminContributions.find(
    item => item.id === recordId
  );

  if (!record) return;

  const reason = window.prompt(
    `Enter the reason for waiving ${record.memberName || record.name || record.memberId}'s contribution:`
  );

  if (!reason || !reason.trim()) {
    showContributionMessage(
      "A reason is required to waive a contribution.",
      "error"
    );
    return;
  }

  const confirmed = window.confirm(
    "Are you sure you want to waive this contribution?"
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
      `/api/admin/contributions/${encodeURIComponent(recordId)}/waive`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          reason: reason.trim()
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to waive contribution."
      );
    }

    showContributionMessage(
      data.message || "Contribution waived successfully.",
      "success"
    );

    await loadAdminContributions();

  } catch (error) {

    console.error("Waive contribution error:", error);

    showContributionMessage(
      error.message,
      "error"
    );

  }

}


/* =========================================
   CONTRIBUTION EVENT LISTENERS
========================================= */

generateContributionsBtn.addEventListener(
  "click",
  generateMonthlyContributions
);

contributionPeriod.addEventListener(
  "change",
  loadAdminContributions
);

contributionSearch.addEventListener(
  "input",
  renderAdminContributions
);

contributionStatusFilter.addEventListener(
  "change",
  renderAdminContributions
);

contributionsContainer.addEventListener(
  "click",
  event => {

    const paymentButton =
      event.target.closest(".contribution-record-payment");

    const waiveButton =
      event.target.closest(".contribution-waive");

    if (paymentButton) {
      recordContributionPayment(
        paymentButton.dataset.id
      );
    }

    if (waiveButton) {
      waiveContribution(
        waiveButton.dataset.id
      );
    }

  }
);

/* =========================================
   CHALLENGE MANAGEMENT
========================================= */

async function loadAdminChallenges() {

  try {

    adminChallengesContainer.innerHTML = `
      <div class="admin-loading">
        Loading challenges...
      </div>
    `;

    const response = await fetch("/api/admin/challenges");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to load challenges."
      );
    }

    adminChallenges = data.challenges || [];

    updateAdminChallengeStats();
    renderAdminChallenges();

  } catch (error) {

    console.error("Challenge loading error:", error);

    adminChallengesContainer.innerHTML = `
      <div class="admin-empty">
        Unable to load challenges.
      </div>
    `;

    showChallengeMessage(error.message, "error");
  }
}


/* =========================================
   CHALLENGE STATISTICS
========================================= */

function updateAdminChallengeStats() {

  const published = adminChallenges.filter(
    challenge => challenge.status === "published"
  );

  const drafts = adminChallenges.filter(
    challenge => challenge.status === "draft"
  );

  const completed = adminChallenges.reduce(
    (total, challenge) =>
      total + Number(challenge.totalCompleted || 0),
    0
  );

  adminChallengeCount.textContent =
    adminChallenges.length;

  adminPublishedChallengeCount.textContent =
    published.length;

  adminDraftChallengeCount.textContent =
    drafts.length;

  adminCompletedChallengeCount.textContent =
    completed;
}


/* =========================================
   RENDER CHALLENGES
========================================= */

function renderAdminChallenges() {

  const search =
    challengeSearch.value.trim().toLowerCase();

  const selectedStatus =
    challengeStatusFilter.value;

  const selectedCategory =
    challengeCategoryFilter.value;

  const filteredChallenges =
    adminChallenges.filter(challenge => {

      const title =
        String(challenge.title || "").toLowerCase();

      const description =
        String(challenge.description || "").toLowerCase();

      const matchesSearch =
        !search ||
        title.includes(search) ||
        description.includes(search);

      const matchesStatus =
        !selectedStatus ||
        challenge.status === selectedStatus;

      const matchesCategory =
        !selectedCategory ||
        challenge.category === selectedCategory;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });

  challengeResultCount.textContent =
    `${filteredChallenges.length} challenge${filteredChallenges.length === 1 ? "" : "s"}`;

  if (!filteredChallenges.length) {

    adminChallengesContainer.innerHTML = `
      <div class="admin-empty">
        No challenges match your search or filters.
      </div>
    `;

    return;
  }

  adminChallengesContainer.innerHTML =
    filteredChallenges.map(challenge => {

      const status =
        challenge.status || "draft";

      const category =
        challenge.category || "academic";

      const actionLabel =
        status === "published"
          ? "Deactivate"
          : "Publish";

      const actionClass =
        status === "published"
          ? "admin-challenge-deactivate"
          : "admin-challenge-publish";

      const startDate =
        challenge.startDate
          ? new Date(
              challenge.startDate + "T00:00:00"
            ).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "Not set";

      const endDate =
        challenge.endDate
          ? new Date(
              challenge.endDate + "T00:00:00"
            ).toLocaleDateString("en-NG", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          : "Not set";

      return `
        <article class="admin-challenge-card">

          <div class="admin-challenge-card-header">

            <div>
              <span class="admin-challenge-category">
                ${escapeHtml(category)}
              </span>

              <h3>
                ${escapeHtml(challenge.title)}
              </h3>
            </div>

            <span class="admin-course-status ${escapeHtml(status)}">
              ${escapeHtml(status.toUpperCase())}
            </span>

          </div>

          <p class="admin-challenge-description">
            ${escapeHtml(challenge.description)}
          </p>

          <div class="admin-challenge-meta">

            <span>
              ${escapeHtml(challenge.type || "daily")}
            </span>

            <span>
              ${Number(challenge.xpReward || 0)} XP
            </span>

            <span>
              ${Number(challenge.totalStarted || 0)} started
            </span>

            <span>
              ${Number(challenge.totalCompleted || 0)} completed
            </span>

          </div>

          <div class="admin-challenge-dates">
            <span>Starts: ${startDate}</span>
            <span>Ends: ${endDate}</span>
          </div>

          <div class="admin-challenge-actions">

            <button
              type="button"
              class="admin-challenge-edit"
              data-id="${escapeHtml(challenge.id)}"
            >
              Edit
            </button>

            <button
              type="button"
              class="${actionClass}"
              data-id="${escapeHtml(challenge.id)}"
            >
              ${actionLabel}
            </button>

            <button
              type="button"
              class="admin-challenge-delete"
              data-id="${escapeHtml(challenge.id)}"
            >
              Delete
            </button>

          </div>

        </article>
      `;

    }).join("");
}


/* =========================================
   OPEN ADD CHALLENGE FORM
========================================= */

addChallengeBtn.addEventListener("click", () => {

  adminChallengeForm.reset();

  challengeOriginalId.value = "";

  challengeFormHeading.textContent =
    "Create New Challenge";

  saveChallengeBtn.textContent =
    "Save Challenge";

  adminChallengeForm.hidden = false;

  adminChallengeForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

});


/* =========================================
   CLOSE CHALLENGE FORM
========================================= */

cancelChallengeBtn.addEventListener("click", () => {

  adminChallengeForm.reset();

  adminChallengeForm.hidden = true;

  challengeOriginalId.value = "";

  showChallengeMessage("", "");

});


/* =========================================
   EDIT CHALLENGE
========================================= */

function editAdminChallenge(challengeId) {

  const challenge = adminChallenges.find(
    item => item.id === challengeId
  );

  if (!challenge) {
    showChallengeMessage(
      "Challenge not found.",
      "error"
    );
    return;
  }

  adminChallengeForm.reset();

  challengeOriginalId.value = challenge.id;

  challengeTitle.value = challenge.title || "";
  challengeCategory.value = challenge.category || "academic";
  challengeType.value = challenge.type || "daily";
  challengeXP.value = challenge.xpReward || "";
  challengeStartDate.value = challenge.startDate || "";
  challengeEndDate.value = challenge.endDate || "";
  challengeDescription.value = challenge.description || "";

  challengeFormHeading.textContent =
    "Edit Challenge";

  saveChallengeBtn.textContent =
    "Update Challenge";

  adminChallengeForm.hidden = false;

  adminChallengeForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}


/* =========================================
   CREATE / UPDATE CHALLENGE
========================================= */

async function saveAdminChallenge(event) {

  event.preventDefault();

  const originalId =
    challengeOriginalId.value.trim();

  const payload = {
    title: challengeTitle.value.trim(),
    description: challengeDescription.value.trim(),
    category: challengeCategory.value,
    type: challengeType.value,
    xpReward: Number(challengeXP.value),
    startDate: challengeStartDate.value,
    endDate: challengeEndDate.value
  };

  if (
    !payload.title ||
    !payload.description ||
    !payload.category ||
    !payload.type ||
    !payload.startDate ||
    !payload.endDate ||
    !Number.isSafeInteger(payload.xpReward) ||
    payload.xpReward <= 0
  ) {

    showChallengeMessage(
      "Please complete all fields with a valid XP reward.",
      "error"
    );

    return;
  }

  if (payload.endDate < payload.startDate) {

    showChallengeMessage(
      "The end date cannot be earlier than the start date.",
      "error"
    );

    return;
  }

  const isEditing = Boolean(originalId);

  saveChallengeBtn.disabled = true;

  saveChallengeBtn.textContent =
    isEditing ? "Updating..." : "Creating...";

  try {

    const response = await fetch(
      isEditing
        ? `/api/admin/challenges/${encodeURIComponent(originalId)}`
        : "/api/admin/challenges",
      {
        method: isEditing ? "PATCH" : "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to save challenge."
      );
    }

    showChallengeMessage(
      isEditing
        ? "Challenge updated successfully."
        : "Challenge created successfully. It is currently a draft.",
      "success"
    );

    adminChallengeForm.reset();
    adminChallengeForm.hidden = true;
    challengeOriginalId.value = "";

    await loadAdminChallenges();

  } catch (error) {

    console.error("Challenge save error:", error);

    showChallengeMessage(
      error.message,
      "error"
    );

  } finally {

    saveChallengeBtn.disabled = false;

    saveChallengeBtn.textContent =
      "Save Challenge";
  }
}


/* =========================================
   PUBLISH / DEACTIVATE CHALLENGE
========================================= */

async function toggleAdminChallenge(challengeId) {

  const challenge = adminChallenges.find(
    item => item.id === challengeId
  );

  if (!challenge) return;

  const newStatus =
    challenge.status === "published"
      ? "inactive"
      : "published";

  const action =
    newStatus === "published"
      ? "publish"
      : "deactivate";

  const confirmed = window.confirm(
    `Are you sure you want to ${action} "${challenge.title}"?`
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
      `/api/admin/challenges/${encodeURIComponent(challengeId)}/status`,
      {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to update challenge status."
      );
    }

   showChallengeMessage(
  newStatus === "published"
    ? "Challenge published successfully."
    : "Challenge deactivated successfully.",
  "success"
);

    await loadAdminChallenges();

  } catch (error) {

    console.error("Challenge status error:", error);

    showChallengeMessage(
      error.message,
      "error"
    );
  }
}


/* =========================================
   DELETE CHALLENGE
========================================= */

async function deleteAdminChallenge(challengeId) {

  const challenge = adminChallenges.find(
    item => item.id === challengeId
  );

  if (!challenge) return;

  const confirmed = window.confirm(
    `Are you sure you want to delete "${challenge.title}"?`
  );

  if (!confirmed) return;

  try {

    const response = await fetch(
      `/api/admin/challenges/${encodeURIComponent(challengeId)}`,
      {
        method: "DELETE"
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Unable to delete challenge."
      );
    }

    showChallengeMessage(
      "Challenge deleted successfully.",
      "success"
    );

    await loadAdminChallenges();

  } catch (error) {

    console.error("Challenge deletion error:", error);

    showChallengeMessage(
      error.message,
      "error"
    );
  }
}


/* =========================================
   CHALLENGE MESSAGES
========================================= */

function showChallengeMessage(message, type) {

  adminChallengeMessage.textContent = message;

  adminChallengeMessage.className =
    `admin-form-message ${type}`;
}


/* =========================================
   CHALLENGE ACTION BUTTONS
========================================= */

adminChallengesContainer.addEventListener(
  "click",
  event => {

    const editButton =
      event.target.closest(".admin-challenge-edit");

    const publishButton =
      event.target.closest(".admin-challenge-publish");

    const deactivateButton =
      event.target.closest(".admin-challenge-deactivate");

    const deleteButton =
      event.target.closest(".admin-challenge-delete");

    if (editButton) {
      editAdminChallenge(editButton.dataset.id);
    }

    if (publishButton || deactivateButton) {
      toggleAdminChallenge(
        (publishButton || deactivateButton).dataset.id
      );
    }

    if (deleteButton) {
      deleteAdminChallenge(deleteButton.dataset.id);
    }

  }
);


/* =========================================
   CHALLENGE SEARCH AND FILTERS
========================================= */

challengeSearch.addEventListener(
  "input",
  renderAdminChallenges
);

challengeStatusFilter.addEventListener(
  "change",
  renderAdminChallenges
);

challengeCategoryFilter.addEventListener(
  "change",
  renderAdminChallenges
);


/* =========================================
   CHALLENGE FORM SUBMISSION
========================================= */

adminChallengeForm.addEventListener(
  "submit",
  saveAdminChallenge
);

/* =========================================
   LOGOUT
========================================= */

logoutBtn.addEventListener(
  "click",
  async () => {

    try {

      await fetch(
        "/api/auth/logout",
        {
          method: "POST"
        }
      );

    } catch (error) {

      console.error(
        "Logout error:",
        error
      );

    }

    window.location.href =
      "/login.html";
  }
);

announcementForm.addEventListener(
  "submit",
  publishAnnouncement
);

adminCourseForm.addEventListener(
  "submit",
  createAdminCourse
);

learningSearch.addEventListener(
  "input",
  renderAdminLearningRecords
);

learningCourseFilter.addEventListener(
  "change",
  renderAdminLearningRecords
);

/* =========================================
   INITIALIZE
========================================= */

async function initializeAdmin() {

  await loadAdmin();

  await Promise.all([
    loadStats(),
    loadMembers(),
    loadAnnouncementCount(),
    loadAdminAnnouncements(),
    loadAdminLearningRecords(),
    loadAdminCourses(),
    loadAdminContributions(),
    loadAdminChallenges()
  ]);

}

initializeAdmin();

/* =========================================
   MOBILE ADMIN SIDEBAR
========================================= */

const adminMenuToggle =
  document.getElementById("adminMenuToggle");

const adminSidebar =
  document.getElementById("adminSidebar");

const adminSidebarOverlay =
  document.getElementById("adminSidebarOverlay");


function openAdminSidebar() {

  adminSidebar.classList.add("mobile-open");

  adminSidebarOverlay.classList.add("active");

  adminMenuToggle.setAttribute(
    "aria-expanded",
    "true"
  );

  document.body.style.overflow = "hidden";
}


function closeAdminSidebar() {

  adminSidebar.classList.remove("mobile-open");

  adminSidebarOverlay.classList.remove("active");

  adminMenuToggle.setAttribute(
    "aria-expanded",
    "false"
  );

  document.body.style.overflow = "";
}


adminMenuToggle.addEventListener(
  "click",
  () => {

    const isOpen =
      adminSidebar.classList.contains("mobile-open");

    if (isOpen) {
      closeAdminSidebar();
    } else {
      openAdminSidebar();
    }

  }
);


adminSidebarOverlay.addEventListener(
  "click",
  closeAdminSidebar
);


adminSidebar.querySelectorAll("a").forEach(link => {

  link.addEventListener(
    "click",
    closeAdminSidebar
  );

});


document.addEventListener("keydown", event => {

  if (event.key === "Escape") {
    closeAdminSidebar();
  }

});


window.addEventListener("resize", () => {

  if (window.innerWidth > 768) {
    closeAdminSidebar();
  }

});
