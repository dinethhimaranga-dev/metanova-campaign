(function () {
  "use strict";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const tasks = [
    { id: "follow-x", title: "Follow MetaNova on X", description: "Follow the official MetaNova account to stay close to campaign news and product updates.", type: "social", platform: "X / Twitter", icon: "𝕏", iconClass: "xicon", reward: 100, category: "Social", destination: "https://x.com/" },
    { id: "like-post", title: "Like the campaign post", description: "Find the official campaign post and like it. Your submission may be reviewed against available platform signals.", type: "social", platform: "X / Twitter", icon: "♡", iconClass: "xicon", reward: 50, category: "Social", destination: "https://x.com/" },
    { id: "join-telegram", title: "Join our Telegram community", description: "Join the official community and keep up with campaign announcements.", type: "community", platform: "Telegram", icon: "➤", iconClass: "telegram", reward: 75, category: "Community", destination: "https://t.me/" },
    { id: "visit-site", title: "Explore the MetaNova website", description: "Explore the project website to learn more about the campaign and its roadmap.", type: "explore", platform: "Website", icon: "↗", iconClass: "web", reward: 25, category: "Explore", destination: "https://example.com/" }
  ];
  const state = { view: "overview", filter: "all", query: "", selectedTask: null, submitted: new Set() };
  const number = value => new Intl.NumberFormat("en-US").format(value);
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }
  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 2800);
  }
  function showInfo(title, body) {
    $("#infoTitle").textContent = title;
    $("#infoBody").textContent = body;
    $("#infoModal").showModal();
  }
  function navigate(view) {
    if (!["overview", "campaigns", "referrals"].includes(view)) return;
    state.view = view;
    $$(".view").forEach(el => el.classList.toggle("active", el.id === "view-" + view));
    $$(".nav-item, .mobile-nav-item").forEach(el => el.classList.toggle("active", el.dataset.view === view));
    $("#breadcrumbCurrent").textContent = ({ overview: "Overview", campaigns: "Campaign tasks", referrals: "Referrals" })[view];
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function taskRow(task) {
    const status = state.submitted.has(task.id);
    return `<div class="task-row"><div class="task-icon ${task.iconClass}">${task.icon}</div><div class="task-info"><strong>${escapeHtml(task.title)}</strong><span>${escapeHtml(task.platform)} · ${status ? "Pending review" : "Verification required"}</span></div><div class="task-reward"><strong>+${number(task.reward)} NOVA</strong><button data-task="${task.id}">${status ? "View status" : "Start mission"}</button></div></div>`;
  }
  function taskCard(task) {
    const status = state.submitted.has(task.id);
    return `<article class="mission-card"><div class="mission-top"><span class="mission-type">${escapeHtml(task.category)}</span><span class="mission-reward">+${number(task.reward)} NOVA</span></div><h3>${escapeHtml(task.title)}</h3><p>${escapeHtml(task.description)}</p><div class="mission-meta"><span class="mission-platform"><span>${task.icon}</span>${escapeHtml(task.platform)}</span><button class="button ${status ? "button-ghost" : "button-primary"}" data-task="${task.id}">${status ? "Pending review" : "View mission"} <span>→</span></button></div></article>`;
  }
  function renderTasks() {
    $("#featuredTasks").innerHTML = tasks.slice(0, 3).map(taskRow).join("");
    const filtered = tasks.filter(task => (state.filter === "all" || task.type === state.filter) && (task.title + " " + task.description + " " + task.platform).toLowerCase().includes(state.query));
    $("#allTasks").innerHTML = filtered.length ? filtered.map(taskCard).join("") : '<div class="empty-state"><strong>No missions found</strong>Try a different search or filter.</div>';
  }
  function openTask(taskId) {
    const task = tasks.find(item => item.id === taskId);
    if (!task) return;
    state.selectedTask = task;
    if (state.submitted.has(taskId)) {
      showInfo("Submission pending", "This demo has already marked this mission as submitted. In the live app, its status will come from the MetaNova backend. NOVA is not awarded until verification succeeds.");
      return;
    }
    $("#taskModalTitle").textContent = task.title;
    $("#taskModalDescription").textContent = task.description;
    $("#taskModalReward").textContent = "+" + number(task.reward) + " NOVA";
    $("#taskModalNotice").textContent = "This preview can open the destination and demonstrate a submission state. A real backend must verify the action before awarding NOVA.";
    $("#taskModal").showModal();
  }
  function openDestination(task) {
    try { window.open(task.destination, "_blank", "noopener,noreferrer"); } catch (_) {}
  }
  async function submitTask() {
    const task = state.selectedTask;
    if (!task) return;
    if (window.MetaNovaAPI && window.MetaNovaAPI.isConfigured) {
      try {
        await window.MetaNovaAPI.submitTask(task.id, "");
        state.submitted.add(task.id);
        $("#taskModal").close();
        renderTasks();
        showToast("Mission submitted for verification.");
      } catch (error) {
        showInfo("Could not submit mission", error.message || "Please try again later.");
      }
      return;
    }
    state.submitted.add(task.id);
    $("#taskModal").close();
    renderTasks();
    showToast("Demo only: mission marked pending review. No NOVA was awarded.");
  }
  function connectX() {
    if (window.MetaNovaAPI && window.MetaNovaAPI.isConfigured) {
      window.MetaNovaAPI.startXOAuth().then(result => {
        if (result && result.authorizationUrl) window.location.assign(result.authorizationUrl);
        else showInfo("Connection unavailable", "The backend did not return an authorization URL.");
      }).catch(error => showInfo("Could not start X authorization", error.message));
      return;
    }
    $("#connectModal").showModal();
  }
  function initProfile() {
    const user = window.MetaNovaTelegram && window.MetaNovaTelegram.user;
    if (user) {
      const label = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Telegram member";
      $("#topUser").textContent = label;
      $("#sideUser").textContent = label;
      $(".avatar").textContent = (user.first_name || "M").slice(0, 1).toUpperCase();
    }
  }
  document.addEventListener("click", event => {
    const viewButton = event.target.closest("[data-view], [data-goto]");
    if (viewButton) { event.preventDefault(); navigate(viewButton.dataset.view || viewButton.dataset.goto); return; }
    const taskButton = event.target.closest("[data-task]");
    if (taskButton) { openTask(taskButton.dataset.task); return; }
    const closeButton = event.target.closest("[data-close]");
    if (closeButton) { $("#" + closeButton.dataset.close).close(); return; }
  });
  $$(".filter-tab").forEach(button => button.addEventListener("click", () => {
    state.filter = button.dataset.filter;
    $$(".filter-tab").forEach(item => item.classList.toggle("active", item === button));
    renderTasks();
  }));
  $("#taskSearch").addEventListener("input", event => { state.query = event.target.value.trim().toLowerCase(); renderTasks(); });
  $("#connectContinue").addEventListener("click", () => {
    $("#connectModal").close();
    showInfo("X authorization needs backend setup", "The live flow uses official X OAuth 2.0 Authorization Code Flow with PKCE. Configure the Cloudflare Worker, X Developer callback URL, server-side state validation, and token storage before enabling real account linking.");
  });
  $("#submitTask").addEventListener("click", submitTask);
  $("#profileButton").addEventListener("click", connectX);
  $("#copyReferral").addEventListener("click", async () => {
    const value = $("#referralUrl").textContent;
    try {
      await navigator.clipboard.writeText(value);
      $("#copyFeedback").textContent = "Demo referral link copied.";
    } catch (_) {
      $("#copyFeedback").textContent = "Select and copy the referral link manually.";
    }
  });
  $("#notificationButton").addEventListener("click", () => showInfo("You're all caught up", "Campaign announcements and verification updates will appear here when the live backend is connected."));
  $("#helpButton").addEventListener("click", () => showInfo("MetaNova help", "Complete a mission, then submit it for verification. NOVA is credited only after the backend confirms eligibility. Never share passwords or private account tokens."));
  $("#announcementMore").addEventListener("click", () => showInfo("Welcome to Genesis Season", "Explore missions, connect your X account through the official authorization flow, and invite friends. This is sample announcement content for the frontend preview."));
  $("#termsButton").addEventListener("click", () => showInfo("Safety first", "This is a frontend demo. Balances, tasks, referrals, and statuses shown here are sample data. Do not use demo balances as real rewards. A production release requires server-side authentication, authorization, verification, and restrictive Firestore rules."));
  $("#mobileHome").addEventListener("click", () => navigate("overview"));
  initProfile();
  renderTasks();
})();