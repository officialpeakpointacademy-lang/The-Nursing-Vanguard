
let allNotes = [];
let allCourses = [];

const noteForm = document.getElementById("noteForm");
const noteId = document.getElementById("noteId");
const noteTitle = document.getElementById("noteTitle");
const noteCourse = document.getElementById("noteCourse");
const noteContent = document.getElementById("noteContent");
const noteFormMessage = document.getElementById("noteFormMessage");
const saveNoteBtn = document.getElementById("saveNoteBtn");
const notesContainer = document.getElementById("notesContainer");
const noteSearch = document.getElementById("noteSearch");
const noteCourseFilter = document.getElementById("noteCourseFilter");


// AUTHENTICATION
async function checkNotesAuth() {
  try {
    const response = await fetch("/api/auth/me");
    const data = await response.json();

    if (!data.user) {
      window.location.href = "/login.html";
      return false;
    }

    const user = data.user;

    const nameElement = document.getElementById("topUserName");
    const idElement = document.getElementById("topUserId");
    const avatarElement = document.getElementById("userAvatar");

    if (nameElement) nameElement.textContent = user.name;
    if (idElement) idElement.textContent = user.id;

    if (avatarElement) {
      avatarElement.textContent = user.name.charAt(0).toUpperCase();
    }

    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}


// LOAD COURSES
async function loadNoteCourses() {
  try {
    const response = await fetch("/api/courses");

    if (!response.ok) {
      throw new Error("Unable to load courses.");
    }

    const data = await response.json();
    allCourses = data.courses || [];

    const options = allCourses.map(course => `
      <option value="${escapeNoteHTML(course.title)}">
        ${escapeNoteHTML(course.title)}
      </option>
    `).join("");

    noteCourse.innerHTML =
      `<option value="">General / No specific course</option>${options}`;

    noteCourseFilter.innerHTML =
      `<option value="">All Courses</option>${options}`;

  } catch (error) {
    console.error("Course loading error:", error);
  }
}


// LOAD NOTES
async function loadNotes() {
  try {
    const response = await fetch("/api/notes");

    if (!response.ok) {
      throw new Error("Unable to load notes.");
    }

    const data = await response.json();
    allNotes = data.notes || [];

    renderNotes();

  } catch (error) {
    console.error("Notes loading error:", error);
  }
}


// ESCAPE HTML
function escapeNoteHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


// RENDER NOTES
function renderNotes() {
  const searchTerm = noteSearch.value.toLowerCase().trim();
  const selectedCourse = noteCourseFilter.value;

  const filteredNotes = allNotes.filter(note => {
    const searchableText =
      `${note.title} ${note.content} ${note.course || ""}`.toLowerCase();

    const matchesSearch = searchableText.includes(searchTerm);
    const matchesCourse =
      !selectedCourse || note.course === selectedCourse;

    return matchesSearch && matchesCourse;
  });

  document.getElementById("totalNotes").textContent = allNotes.length;

  notesContainer.innerHTML = filteredNotes.map(note => `
    <article class="note-card">
      <div class="note-card-header">
        <span class="note-course-tag">
          ${escapeNoteHTML(note.course || "General")}
        </span>

        <span class="note-date">
          ${new Date(note.updatedAt).toLocaleDateString()}
        </span>
      </div>

      <h3>${escapeNoteHTML(note.title)}</h3>

      <p>${escapeNoteHTML(note.content).replace(/\n/g, "<br>")}</p>

      <div class="note-card-actions">
        <button type="button" class="edit-note-btn" data-id="${escapeNoteHTML(note.id)}">
          Edit
        </button>

        <button type="button" class="delete-note-btn" data-id="${escapeNoteHTML(note.id)}">
          Delete
        </button>
      </div>
    </article>
  `).join("");

  document.getElementById("notesEmptyState").hidden =
    filteredNotes.length > 0;
}


// RESET EDITOR
function resetNoteEditor() {
  noteForm.reset();
  noteId.value = "";

  document.getElementById("noteEditorStatus").textContent = "New Note";
  saveNoteBtn.textContent = "Save Note";
  noteFormMessage.textContent = "";
}


// SAVE OR UPDATE NOTE
async function saveNote(event) {
  event.preventDefault();

  const id = noteId.value;

  const payload = {
    title: noteTitle.value.trim(),
    course: noteCourse.value,
    content: noteContent.value.trim()
  };

  if (!payload.title || !payload.content) {
    noteFormMessage.textContent =
      "Please enter a title and write your note.";
    return;
  }

  saveNoteBtn.disabled = true;
  saveNoteBtn.textContent = "Saving...";

  try {
    const response = await fetch(
      id ? `/api/notes/${id}` : "/api/notes",
      {
        method: id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to save note.");
    }

    resetNoteEditor();
    await loadNotes();

    noteFormMessage.textContent = "Note saved successfully.";

  } catch (error) {
    noteFormMessage.textContent = error.message;
  } finally {
    saveNoteBtn.disabled = false;
    saveNoteBtn.textContent = noteId.value ? "Update Note" : "Save Note";
  }
}


// EDIT NOTE
function editNote(id) {
  const note = allNotes.find(item => item.id === id);

  if (!note) return;

  noteId.value = note.id;
  noteTitle.value = note.title;
  noteCourse.value = note.course || "";
  noteContent.value = note.content;

  document.getElementById("noteEditorStatus").textContent = "Editing Note";
  saveNoteBtn.textContent = "Update Note";
  noteFormMessage.textContent = "You are editing a saved note.";

  noteForm.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  noteTitle.focus();
}


// DELETE NOTE
async function deleteNote(id) {
  const confirmed = confirm("Are you sure you want to delete this note?");

  if (!confirmed) return;

  try {
    const response = await fetch(`/api/notes/${id}`, {
      method: "DELETE"
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to delete note.");
    }

    await loadNotes();

  } catch (error) {
    alert(error.message);
  }
}


// EVENT LISTENERS
noteForm.addEventListener("submit", saveNote);

noteSearch.addEventListener("input", renderNotes);
noteCourseFilter.addEventListener("change", renderNotes);

document.getElementById("clearNoteBtn").addEventListener("click", () => {
  if (
    noteTitle.value ||
    noteContent.value ||
    noteId.value
  ) {
    const confirmed = confirm(
      "Clear the editor? Unsaved changes will be lost."
    );

    if (!confirmed) return;
  }

  resetNoteEditor();
});

notesContainer.addEventListener("click", event => {
  const editButton = event.target.closest(".edit-note-btn");
  const deleteButton = event.target.closest(".delete-note-btn");

  if (editButton) {
    editNote(editButton.dataset.id);
  }

  if (deleteButton) {
    deleteNote(deleteButton.dataset.id);
  }
});


// MOBILE MENU
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.querySelector(".sidebar");
const mobileOverlay = document.getElementById("mobileOverlay");

if (menuToggle && sidebar && mobileOverlay) {
  menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    mobileOverlay.classList.toggle("active");
  });

  mobileOverlay.addEventListener("click", () => {
    sidebar.classList.remove("active");
    mobileOverlay.classList.remove("active");
  });
}


// LOGOUT
const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", async event => {
    event.preventDefault();

    await fetch("/api/auth/logout", {
      method: "POST"
    });

    window.location.href = "/login.html";
  });
}


// INITIALISE
async function initialiseNotesPage() {
  const authenticated = await checkNotesAuth();

  if (!authenticated) return;

  await loadNoteCourses();
  await loadNotes();
}

initialiseNotesPage();
