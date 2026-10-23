/* API boundary. Configure API_BASE after deploying the Cloudflare Worker.
   Never trust client-side balances, Telegram user IDs, or task statuses. */
(function () {
  const API_BASE = ""; // Example: "https://metanova-api.YOUR_SUBDOMAIN.workers.dev"
  async function request(path, options) {
    if (!API_BASE) throw new Error("Backend is not configured yet. This is a frontend preview.");
    const response = await fetch(API_BASE + path, Object.assign({
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Init-Data": window.MetaNovaTelegram ? window.MetaNovaTelegram.initData : ""
      }
    }, options || {}));
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || "Request failed. Please try again.");
    return payload;
  }
  window.MetaNovaAPI = {
    isConfigured: Boolean(API_BASE),
    getMe: () => request("/api/me"),
    getTasks: () => request("/api/tasks"),
    submitTask: (taskId, proof) => request("/api/tasks/" + encodeURIComponent(taskId) + "/submit", {
      method: "POST", body: JSON.stringify({ proof: proof || "" })
    }),
    getReferrals: () => request("/api/referrals"),
    startXOAuth: () => request("/api/auth/x/start", { method: "POST" })
  };
})();