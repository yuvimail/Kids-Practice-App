# Kids Practice App

Daily English + Maths practice app for kids.
Works on **any device** via Chrome. All data stored in Google Sheets.

---

## Delivery Folder Contents

```
delivery/
├── index.html                ← The entire app (only file needed to run the app)
├── google_apps_script.js     ← Backend — paste into Google Apps Script
├── import_content.js         ← One-time content import — paste into Apps Script
└── README.md                 ← This file
```

---

## Users & Admin

| Name     | Grade | Type  |
|----------|-------|-------|
| Praneeth | 7     | Student |
| Kathir   | 4     | Student |
| Admin    | —     | Admin   |

Admin PIN: **996633**

---

## How to Use the App

Just open `index.html` in Chrome — or use the live URL if already deployed.

- Tap your name → English practice starts
- After English → Maths starts automatically
- After both done → results and scores shown
- Each day has a unique passage (day 1 = passage 1, day 2 = passage 2, etc.)

---

## First-Time Setup (Google Cloud)

> Skip this if already set up and working.

### Step 1 — Create Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new blank spreadsheet → name it `Kids Practice Data`

### Step 2 — Set Up Apps Script

1. In the sheet → **Extensions → Apps Script**
2. Delete all existing code
3. Open `google_apps_script.js` → copy all → paste into editor
4. Click **Save** 💾 → name project `KidsPractice`

### Step 3 — Deploy as Web App

1. **Deploy → New deployment**
2. Gear icon ⚙️ → **Web app**
3. Execute as: **Me** | Who has access: **Anyone**
4. Click **Deploy → Authorize → Allow**
5. Copy the Web App URL:
   ```
   https://script.google.com/macros/s/XXXXXXXXXX/exec
   ```

### Step 4 — Add URL to index.html

Open `index.html` in a text editor, find and update:
```javascript
const SCRIPT_URL = 'https://script.google.com/macros/s/XXXXXXXXXX/exec';
```

### Step 5 — Import Content into Sheet

1. In Apps Script → click **➕ New file → Script** → name it `ImportData`
2. Open `import_content.js` → copy all → paste into `ImportData`
3. Click **Save**
4. Function dropdown → select **importAllContent** → click **▶ Run**
   - Wait for log: `Content import done: 142 rows`
5. Function dropdown → select **importAllMaths** → click **▶ Run**
   - Wait for log: `Maths import done: 142 rows`

### Step 6 — Test

Open `index.html` in Chrome → tap a student name → app should sync and load content.

---

## Accessing the App

### Option A — Local file
- Double-click `index.html` on any PC

### Option B — Google Drive (Android/iOS)
- Upload `index.html` to Google Drive
- Open in Chrome on your phone

### Option C — Apps Script URL (any device, no file needed)
- Open the Web App URL directly in any browser
- Bookmark it on kids' devices

---

## Admin Panel

Tap **Admin** on home screen → PIN: **996633**

| Feature | How |
|---|---|
| View student progress | Dashboard table |
| View attempt details | **Details** button |
| Review past attempt (full Q&A) | **View** button in attempt history |
| Delete an attempt | **✕** button in attempt history |
| Add new student | **➕ Add User** |
| Edit student name/grade | **Edit** button |
| Export backup | **⬇️ Export Backup** → saves `.json` file |
| Import/restore backup | **⬆️ Import Backup** → select `.json` file |
| Reset all data | **Reset All Data** (irreversible) |

---

## Backup & Restore

### Export
Admin panel → **⬇️ Export Backup** → saves `kids_backup_YYYY-MM-DD.json`

### Restore
Admin panel → **⬆️ Import Backup** → select the `.json` file
Data is restored locally and synced to Google Sheet automatically.

---

## Moving to a New Device

Since data is in Google Sheets:
1. Copy `index.html` to the new device (or open via Google Drive / Web App URL)
2. Open in Chrome — everything syncs automatically

---

## Adding New Grades

1. Create content and maths JS files for the new grade
2. Generate a new `import_content.js` using the same Node.js script
3. Run `importAllContent` and `importAllMaths` in Apps Script
4. Redeploy (Deploy → Manage deployments → edit → New version → Deploy)
5. Admin panel → **➕ Add User** → set the new grade

---

## Redeploying After Script Changes

Whenever `google_apps_script.js` is updated:
1. Apps Script editor → **Deploy → Manage deployments**
2. Click **✏️ Edit**
3. Version → **New version**
4. Click **Deploy**

> The Web App URL stays the same — no need to update `index.html`.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| "No content yet" | Check `SCRIPT_URL` in `index.html` is correct |
| Passages empty `{"passages":[]}` | Run `importAllContent` / `importAllMaths` in Apps Script |
| Data not syncing | Check internet connection |
| Script changes not working | Redeploy with a new version (see above) |
| Forgot admin PIN | Search `ADMIN_PIN` in `index.html` — it's `996633` |

---

## Data Storage Reference

| Data | Location |
|---|---|
| Student attempts | Google Sheet → `records` tab |
| User list | Google Sheet → `users` tab |
| English passages | Google Sheet → `content` tab |
| Maths questions | Google Sheet → `maths` tab |
| Local cache | Browser localStorage (auto-updated on sync) |
