const learningForm = document.getElementById("learningForm");

const learningDate = document.getElementById("learningDate");
const daySelect = document.getElementById("day");

const formMessage = document.getElementById("formMessage");
const recordsList = document.getElementById("recordsList");


// Automatically set today's date
const today = new Date();

learningDate.value = today.toISOString().split("T")[0];


// Automatically select weekday
const weekday = today.toLocaleDateString("en-US", {
  weekday: "long"
});

if (
  ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    .includes(weekday)
) {
  daySelect.value = weekday;
}


// Load logged-in user
async function loadUser() {

  try {

    const response = await fetch("/api/auth/me");

    if (!response.ok) {
      window.location.href = "/login.html";
      return;
    }

    const data = await response.json();

    if (!data.user) {
      window.location.href = "/login.html";
      return;
    }

    const user = data.user;

    const name = user.name || "Member";
    const id = user.id || "TNV/000";

    document.getElementById("topUserName").textContent = name;
    document.getElementById("topUserId").textContent = id;

    document.getElementById("userAvatar").textContent =
      name.charAt(0).toUpperCase();

    loadRecords();

  } catch (error) {

    console.error("User loading error:", error);

  }

}


// Submit record
learningForm.addEventListener("submit", async function (event) {

  event.preventDefault();

  const submitButton =
    document.getElementById("submitRecord");

  submitButton.disabled = true;
  submitButton.textContent = "Saving...";

  const record = {

    date: learningDate.value,

    day: daySelect.value,

    course: document.getElementById("course").value.trim(),

    lecturer: document.getElementById("lecturer").value.trim(),

    learned: document.getElementById("learned").value.trim(),

    takeaway: document.getElementById("takeaway").value.trim()

  };


  try {

    const response = await fetch(
      "/api/learning-records",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify(record)
      }
    );


    const data = await response.json();


    if (!response.ok) {

      throw new Error(
        data.message || "Unable to save record."
      );

    }


    formMessage.textContent =
      "✓ Learning record saved successfully!";

    formMessage.className =
      "form-message success";


    learningForm.reset();


    learningDate.value =
      new Date().toISOString().split("T")[0];


    daySelect.value =
      new Date().toLocaleDateString(
        "en-US",
        { weekday: "long" }
      );


    loadRecords();


  } catch (error) {

    console.error(error);

    formMessage.textContent =
      error.message;

    formMessage.className =
      "form-message error";

  }


  submitButton.disabled = false;

  submitButton.textContent =
    "Save Learning Record →";

});


// Load previous records
async function loadRecords() {

  try {

    const response =
      await fetch("/api/learning-records");

    if (!response.ok) {
      return;
    }

    const data =
      await response.json();

    displayRecords(data.records || []);

  } catch (error) {

    console.error(
      "Unable to load records:",
      error
    );

  }

}


// Display records
function displayRecords(records) {

  if (!records.length) {

    recordsList.innerHTML = `

      <div class="empty-records">

        <div>📚</div>

        <h3>No learning records yet</h3>

        <p>
          Your submitted learning records will appear here.
        </p>

      </div>

    `;

    return;

  }


  recordsList.innerHTML =
    records.map(record => `

      <article class="record-item">

        <div class="record-date">

          <strong>${record.day}</strong>

          <span>${record.date}</span>

        </div>


        <div class="record-content">

          <h3>${escapeHTML(record.course)}</h3>

          <p class="record-lecturer">
            Lecturer: ${escapeHTML(record.lecturer)}
          </p>

          <p>
            ${escapeHTML(record.learned)}
          </p>

          ${
            record.takeaway
              ? `
                <div class="record-takeaway">
                  <strong>Key Takeaway:</strong>
                  ${escapeHTML(record.takeaway)}
                </div>
              `
              : ""
          }

        </div>

      </article>

    `).join("");


  updateWeekProgress(records);

}


// Weekly progress
function updateWeekProgress(records) {

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday"
  ];


  days.forEach(day => {

    const element =
      document.getElementById(
        `${day}Status`
      );

    if (!element) return;


    const exists =
      records.some(
        record =>
          record.day.toLowerCase() === day
      );


    element.textContent =
      exists ? "✓ Done" : "—";

    element.className =
      exists ? "completed" : "";

  });

}


// Security helper
function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// Logout
document
  .getElementById("logoutBtn")
  .addEventListener("click", async () => {

    await fetch(
      "/api/auth/logout",
      {
        method: "POST"
      }
    );

    window.location.href =
      "/login.html";

  });


// Mobile menu
const menuToggle =
  document.getElementById("menuToggle");

const sidebar =
  document.getElementById("sidebar");

const mobileOverlay =
  document.getElementById("mobileOverlay");


menuToggle.addEventListener("click", () => {

  sidebar.classList.toggle("open");

  mobileOverlay.classList.toggle(
    "active"
  );

});


mobileOverlay.addEventListener(
  "click",
  () => {

    sidebar.classList.remove("open");

    mobileOverlay.classList.remove(
      "active"
    );

  }
);


// Start
loadUser();