# MetaNova Frontend Preview

A responsive, mobile-first dark-theme frontend for the MetaNova Telegram Airdrop Campaign Mini App.

## Files
- `index.html` — app layout and dialogs
- `css/style.css` — responsive visual design
- `js/telegram.js` — Telegram Mini App SDK bootstrap
- `js/api.js` — API boundary for a future Cloudflare Worker
- `js/app.js` — demo interactions and sample campaign data

## Run without installing anything
1. Upload these files to your existing `airdrop-miniapp` GitHub repository using the browser.
2. In Cloudflare Pages, connect the repository and set the build command to blank / none and the output directory to `/` (or the directory containing `index.html`).
3. Open the Pages URL to preview the frontend.

## Important security and integration notes
- This is a **frontend preview**, not a production-ready airdrop system.
- The balance, task counts, announcement, and referral figures are illustrative sample data. They are not real account data.
- Demo task submission only changes the local page state. It does not verify an action or award NOVA.
- `js/api.js` intentionally has an empty `API_BASE`. Configure it only after deploying your Cloudflare Worker endpoints.
- Telegram `initData` must be validated on the server. Do not trust `initDataUnsafe` for authentication.
- Implement X OAuth 2.0 Authorization Code Flow with PKCE on the backend. Never collect X passwords or expose OAuth tokens in browser code.
- Use restrictive Firestore Security Rules and backend authorization. Clients must not write NOVA balances or task approval statuses.
- No leaderboard, daily streak, daily check-in, or streak bonus features are included.

## Recommended next integration steps
1. Build the Worker endpoints for session/authentication and X OAuth start/callback.
2. Return real profile data from a protected `/api/me` endpoint and replace demo profile/balance fields.
3. Fetch campaign tasks from `/api/tasks` and submit them to the server.
4. Implement official API verification where permitted, otherwise use administrator review.
5. Add server-authoritative NOVA ledger, referrals, and protected admin endpoints.
6. Test the full flow inside the existing Telegram bot before announcing the campaign.
