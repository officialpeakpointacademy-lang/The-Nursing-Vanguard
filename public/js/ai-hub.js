

const aiTools = [
  {
    name: "ChatGPT",
    description: "Understand nursing concepts, practise questions, analyse information and organise your studies.",
    category: ["learning", "writing", "assistant"],
    icon: "🤖",
    url: "https://chatgpt.com",
    tag: "Study Assistant"
  },
  {
    name: "Claude",
    description: "Analyse long documents, organise information and develop clear academic explanations.",
    category: ["learning", "writing", "assistant"],
    icon: "🧠",
    url: "https://claude.ai",
    tag: "Writing & Analysis"
  },
  {
    name: "Google Gemini",
    description: "Explore concepts, ask questions and work with text, images and learning materials.",
    category: ["learning", "research", "assistant"],
    icon: "✨",
    url: "https://gemini.google.com",
    tag: "Learning Assistant"
  },
  {
    name: "Perplexity",
    description: "Explore research topics and discover sources for further academic reading.",
    category: ["research", "learning"],
    icon: "🔎",
    url: "https://www.perplexity.ai",
    tag: "Research Assistant"
  },
  {
    name: "Grok",
    description: "Explore questions, generate ideas and investigate topics through an AI assistant.",
    category: ["learning", "reasoning", "assistant"],
    icon: "⚡",
    url: "https://grok.com",
    tag: "AI Assistant"
  },
  {
    name: "DeepSeek",
    description: "Work through complex questions, reasoning tasks and academic problem-solving.",
    category: ["reasoning", "learning"],
    icon: "🔬",
    url: "https://chat.deepseek.com",
    tag: "Reasoning Assistant"
  },
  {
    name: "Chatbox",
    description: "Organise AI conversations using supported AI providers in a dedicated chat interface.",
    category: ["assistant", "learning"],
    icon: "💬",
    url: "https://chatboxai.app",
    tag: "AI Workspace"
  },
  {
    name: "Microsoft Copilot",
    description: "Get explanations, explore ideas and improve everyday academic productivity.",
    category: ["learning", "writing", "assistant"],
    icon: "🪟",
    url: "https://copilot.microsoft.com",
    tag: "Productivity"
  },
  {
    name: "NotebookLM",
    description: "Study your uploaded materials and ask questions based on your own documents.",
    category: ["learning", "research"],
    icon: "📓",
    url: "https://notebooklm.google.com",
    tag: "Study Companion"
  },
  {
    name: "SciSpace",
    description: "Understand academic papers and explore scientific literature.",
    category: ["research", "learning"],
    icon: "🧪",
    url: "https://scispace.com",
    tag: "Research Tool"
  },
  {
    name: "Elicit",
    description: "Find and organise research evidence to support academic investigations.",
    category: ["research"],
    icon: "📑",
    url: "https://elicit.com",
    tag: "Research Discovery"
  },
  {
    name: "Consensus",
    description: "Explore research findings and evidence related to academic questions.",
    category: ["research"],
    icon: "📚",
    url: "https://consensus.app",
    tag: "Evidence Discovery"
  },
  {
    name: "ResearchRabbit",
    description: "Discover related academic papers, authors and research connections.",
    category: ["research"],
    icon: "🐇",
    url: "https://www.researchrabbit.ai",
    tag: "Literature Discovery"
  },
  {
    name: "Semantic Scholar",
    description: "Search scientific publications and discover relevant academic literature.",
    category: ["research"],
    icon: "🎓",
    url: "https://www.semanticscholar.org",
    tag: "Academic Search"
  },
  {
    name: "Wolfram Alpha",
    description: "Solve calculations and explore mathematics, statistics and scientific concepts.",
    category: ["reasoning", "learning"],
    icon: "➗",
    url: "https://www.wolframalpha.com",
    tag: "Calculations"
  },
  {
    name: "Grammarly",
    description: "Improve grammar, clarity, spelling and the presentation of academic writing.",
    category: ["writing"],
    icon: "✍️",
    url: "https://www.grammarly.com",
    tag: "Writing Support"
  },
  {
    name: "QuillBot",
    description: "Improve sentence clarity and summarise text while preserving its intended meaning.",
    category: ["writing", "learning"],
    icon: "📝",
    url: "https://quillbot.com",
    tag: "Writing Assistant"
  },
  {
    name: "Gamma",
    description: "Create presentations and organise educational content into visual slides.",
    category: ["writing", "assistant"],
    icon: "📊",
    url: "https://gamma.app",
    tag: "Presentation Creator"
  },
  {
    name: "Canva AI",
    description: "Design educational graphics, presentations, posters and learning materials.",
    category: ["writing", "assistant"],
    icon: "🎨",
    url: "https://www.canva.com",
    tag: "Design Assistant"
  },
  {
    name: "Quizlet",
    description: "Create flashcards, practise recall and revise important course concepts.",
    category: ["learning"],
    icon: "🗂️",
    url: "https://quizlet.com",
    tag: "Revision Tool"
  },
  {
    name: "Khan Academy",
    description: "Access structured educational lessons and practise foundational science concepts.",
    category: ["learning"],
    icon: "📖",
    url: "https://www.khanacademy.org",
    tag: "Learning Resource"
  }
];


const aiPrompts = [
  {
    title: "Explain a Nursing Topic",
    category: "Learning",
    prompt: "Act as an experienced nursing tutor. Explain [TOPIC] in simple language. Cover definition, causes, pathophysiology, signs and symptoms, investigations, treatment principles and nursing management. Include key examination points."
  },
  {
    title: "Anatomy and Physiology Tutor",
    category: "Anatomy",
    prompt: "Teach me about [BODY SYSTEM]. Explain its structures, location, functions, blood supply, nerve supply and clinical importance. Give examples and test my understanding."
  },
  {
    title: "Pharmacology Study Assistant",
    category: "Pharmacology",
    prompt: "Explain [DRUG OR DRUG CLASS]. Cover classification, mechanism of action, indications, contraindications, side effects, adverse reactions and nursing responsibilities. Identify information that requires checking against an approved drug reference."
  },
  {
    title: "Compare Two Diseases",
    category: "Clinical Learning",
    prompt: "Compare [DISEASE A] and [DISEASE B]. Explain their causes, risk factors, pathophysiology, clinical manifestations, investigations, treatment principles and nursing management. Use a comparison table."
  },
  {
    title: "Generate Nursing MCQs",
    category: "Examination",
    prompt: "Generate 20 multiple-choice nursing examination questions on [TOPIC]. Include four options, correct answers and detailed explanations. Cover easy, moderate and challenging questions."
  },
  {
    title: "Short-Answer Examination Questions",
    category: "Examination",
    prompt: "Generate 15 short-answer and essay questions on [TOPIC]. Provide model answers and indicate the key points required for full marks."
  },
  {
    title: "Clinical Scenario Questions",
    category: "Examination",
    prompt: "Create 10 nursing clinical scenarios on [TOPIC]. Test assessment, prioritisation, clinical reasoning and nursing interventions. Explain the answers."
  },
  {
    title: "Mock Nursing Examination",
    category: "Examination",
    prompt: "Prepare a mock examination on [COURSE]. Include 30 MCQs and 5 short-answer questions. Hide the answers until I submit my responses, then mark and explain my mistakes."
  },
  {
    title: "Explain Examination Answers",
    category: "Examination",
    prompt: "Explain why the correct answer to this nursing question is correct and why every other option is incorrect. Teach me the concept behind the question."
  },
  {
    title: "Explain a Nursing Procedure",
    category: "Clinical Skills",
    prompt: "Explain [PROCEDURE] step by step for educational purposes. Cover purpose, indications, equipment, preparation, procedure, safety precautions, documentation and aftercare. Include the need for supervision and institutional protocols."
  },
  {
    title: "Develop a Nursing Care Plan",
    category: "Clinical Skills",
    prompt: "Create an educational nursing care plan for a hypothetical patient with [CONDITION]. Include assessment, nursing diagnoses, goals, expected outcomes, interventions, rationales and evaluation."
  },
  {
    title: "Patient Assessment Guide",
    category: "Clinical Skills",
    prompt: "Teach me how to assess a patient presenting with [SYMPTOM]. Cover history taking, physical assessment, vital signs, warning signs, documentation and escalation."
  },
  {
    title: "Clinical Case Study Practice",
    category: "Clinical Skills",
    prompt: "Create a fictional nursing case study about [CONDITION]. Ask me questions about assessment, nursing priorities and interventions one at a time. Evaluate my responses."
  },
  {
    title: "Understand Nursing Diagnoses",
    category: "Clinical Skills",
    prompt: "Explain possible nursing diagnoses for [CONDITION]. Link assessment findings to diagnoses, outcomes and interventions. Distinguish nursing diagnoses from medical diagnoses."
  },
  {
    title: "Develop a Research Topic",
    category: "Research",
    prompt: "Suggest suitable undergraduate nursing research topics in [AREA]. Explain the focus, possible research gap, relevance and how each topic could be investigated."
  },
  {
    title: "Research Proposal Outline",
    category: "Research",
    prompt: "Develop a research proposal outline on [TOPIC]. Include background, problem statement, aim, objectives, research questions, significance, scope and possible methodology. Do not invent findings or statistics."
  },
  {
    title: "Summarise a Research Article",
    category: "Research",
    prompt: "Analyse the research article I provide. Summarise its background, aim, methodology, sample, findings, conclusion, limitations and relevance to nursing practice."
  },
  {
    title: "Research Methodology Tutor",
    category: "Research",
    prompt: "Teach me [RESEARCH METHODOLOGY TOPIC]. Explain the terminology, types, processes, advantages, limitations and practical examples. Finish with examination questions."
  },
  {
    title: "Referencing Assistant",
    category: "Academic Writing",
    prompt: "Format the references I provide using [APA 7TH EDITION OR REQUIRED STYLE]. Identify missing details and errors. Never invent authors, publication dates, DOIs or URLs."
  },
  {
    title: "Create Nursing Flashcards",
    category: "Revision",
    prompt: "Create 25 question-and-answer flashcards on [TOPIC]. Cover definitions, classifications, functions, causes, symptoms, management and examination facts."
  },
  {
    title: "Weekly Study Timetable",
    category: "Productivity",
    prompt: "Create a realistic weekly study timetable for a nursing student studying [COURSES]. Include lectures, revision, practice questions, clinical learning and breaks."
  },
  {
    title: "Summarise Lecture Notes",
    category: "Revision",
    prompt: "Turn the lecture notes I provide into comprehensive revision notes. Use headings, definitions, explanations, examples, tables and key examination points. Preserve important information."
  },
  {
    title: "Create Memory Mnemonics",
    category: "Revision",
    prompt: "Create easy-to-remember mnemonics for [TOPIC OR LIST]. Explain each letter and show how the mnemonic helps me remember the information accurately."
  },
  {
    title: "Revision Checklist",
    category: "Revision",
    prompt: "Create a detailed revision checklist for [COURSE]. Break it into topics and learning objectives, with boxes to tick and a short self-assessment."
  },
  {
    title: "Explain Medical Terminologies",
    category: "Terminology",
    prompt: "Explain these medical and nursing terms: [INSERT TERMS]. Give each definition, word roots where relevant, pronunciation guidance and a simple clinical example."
  }
];

// HTML SAFETY
function escapeAIHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}

// RENDER AI TOOLS
function renderAITools() {
  const grid = document.getElementById("aiToolsGrid");
  const emptyState = document.getElementById("aiEmptyState");

  if (!grid) return;

  const search = document.getElementById("aiSearch").value
    .toLowerCase().trim();

  const category = document.getElementById("aiCategoryFilter").value;

  const filtered = aiTools.filter(tool => {
    const matchesSearch =
      `${tool.name} ${tool.description} ${tool.tag}`
        .toLowerCase().includes(search);

    const matchesCategory =
      category === "all" || tool.category.includes(category);

    return matchesSearch && matchesCategory;
  });

  grid.innerHTML = filtered.map(tool => `
    <article class="ai-tool-card">
      <div class="ai-tool-card-top">
        <div class="ai-tool-icon">${tool.icon}</div>
        <span class="ai-tool-tag">${escapeAIHTML(tool.tag)}</span>
      </div>

      <h3>${escapeAIHTML(tool.name)}</h3>
      <p>${escapeAIHTML(tool.description)}</p>

      <a
        href="${tool.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="primary-btn ai-launch-btn"
      >
        Open ${escapeAIHTML(tool.name)} ↗
      </a>
    </article>
  `).join("");

  if (emptyState) {
    emptyState.hidden = filtered.length > 0;
  }
}

// RENDER PROMPTS

function renderAIPrompts() {
  const grid = document.getElementById("aiPromptGrid");
  const emptyState = document.getElementById("aiPromptEmptyState");
  const count = document.getElementById("aiPromptCount");

  if (!grid) return;

  const search = document.getElementById("aiPromptSearch")
    .value.toLowerCase().trim();

  const category = document.getElementById("aiPromptCategory").value;

  const filteredPrompts = aiPrompts
    .map((prompt, index) => ({ ...prompt, originalIndex: index }))
    .filter(prompt => {
      const matchesSearch =
        `${prompt.title} ${prompt.category} ${prompt.prompt}`
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        category === "all" || prompt.category === category;

      return matchesSearch && matchesCategory;
    });

  grid.innerHTML = filteredPrompts.map(prompt => `
    <article class="ai-prompt-card">
      <span class="ai-prompt-category">
        ${escapeAIHTML(prompt.category)}
      </span>

      <h3>${escapeAIHTML(prompt.title)}</h3>

      <p>${escapeAIHTML(prompt.prompt)}</p>

      <button
        type="button"
        class="secondary-btn copy-prompt-btn"
        data-index="${prompt.originalIndex}"
      >
        Copy Prompt
      </button>
    </article>
  `).join("");

  if (count) {
    count.textContent =
      `${filteredPrompts.length} of ${aiPrompts.length} prompts`;
  }

  if (emptyState) {
    emptyState.hidden = filteredPrompts.length > 0;
  }
}

// COPY PROMPT
document.getElementById("aiPromptGrid").addEventListener("click", async event => {
  const button = event.target.closest(".copy-prompt-btn");

  if (!button) return;

  const prompt = aiPrompts[Number(button.dataset.index)];

  try {
    await navigator.clipboard.writeText(prompt.prompt);
    button.textContent = "Copied!";
    setTimeout(() => {
      button.textContent = "Copy Prompt";
    }, 1500);
  } catch (error) {
    alert("Unable to copy. Please select and copy the prompt manually.");
  }
});

// SEARCH AND FILTER
document.getElementById("aiSearch").addEventListener("input", renderAITools);

document.getElementById("aiCategoryFilter").addEventListener(
  "change",
  renderAITools
);

document.getElementById("aiPromptSearch").addEventListener(
  "input",
  renderAIPrompts
);

document.getElementById("aiPromptCategory").addEventListener(
  "change",
  renderAIPrompts
);

// AUTHENTICATION
async function checkAIHubAuth() {
  try {
    const response = await fetch("/api/auth/me");
    const data = await response.json();

    if (!data.user) {
      window.location.href = "/login.html";
      return false;
    }

    const user = data.user;

    document.getElementById("topUserName").textContent = user.name;
    document.getElementById("topUserId").textContent = user.id;
    document.getElementById("userAvatar").textContent =
      user.name.charAt(0).toUpperCase();

    return true;
  } catch (error) {
    console.error("Authentication error:", error);
    return false;
  }
}

// SIDEBAR CONTROLS

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

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/login.html";
});

// INITIALISE
async function initialiseAIHub() {
  const authenticated = await checkAIHubAuth();

  if (!authenticated) return;

  renderAITools();
  renderAIPrompts();
}

initialiseAIHub();
