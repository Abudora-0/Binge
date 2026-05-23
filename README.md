# Binge — Video Streaming Platform

A full-stack video streaming web application built with Node.js, Express, EJS, and MySQL. Binge allows users to watch, like, comment on, and save videos; creators to upload and manage their channels; and admins to moderate the platform and generate PDF analytics reports.

---

## Features

### Viewer
- Browse and watch videos with YouTube embed support
- Like / unlike videos
- Subscribe and unsubscribe from creator channels
- Comment on videos
- Save videos to playlists
- View watch history (with delete / clear all)
- View subscriptions feed
- Report videos for moderation
- Manage profile and avatar

### Creator
- Upload videos (via stored procedure)
- Edit and delete videos (with tag management in a transaction)
- View channel dashboard with aggregated stats (via stored procedure)
- Manage channel name and bio
- Update profile and avatar

### Admin
- View platform-wide stats (users, videos, creators, comments, views, reports)
- Manage all users — suspend / activate accounts
- Delete any video
- Resolve pending content reports
- View creator overview table (powered by `vw_CreatorDashboard`)
- Generate 10 filterable PDF reports

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Templating | EJS |
| Styling | Tailwind CSS (CDN) + custom CSS |
| Database | MySQL 8 |
| Auth | bcryptjs + express-session |
| File Uploads | Multer |
| PDF Generation | PDFKit |
| DB Driver | mysql2 (callback-based) |

---

## Database Design

### Tables (16)
`user`, `creator`, `video`, `category`, `tag`, `videotag`, `comment`, `likes`, `subscription`, `playlist`, `playlistitem`, `watchhistory`, `report`, `notification`, `advertisement`, `revenuelog`

### Views (7)
| View | Used In |
|---|---|
| `vw_CreatorDashboard` | Admin — Creators tab |
| `vw_CreatorStats` | PDF — Creator Stats report |
| `vw_TrendingVideos` | PDF — Trending Videos report |
| `vw_TopCategories` | PDF — Category Engagement report |
| `vw_VideoEngagement` | PDF — Video Engagement report |
| `vw_MonthlyWatchSummary` | PDF — Monthly Watch report |
| `vw_UserActivity` | PDF — User Activity report |

### Stored Procedures (3)
| Procedure | Called From |
|---|---|
| `sp_UploadVideo` | Creator uploads a video |
| `sp_GetCreatorStats` | Creator dashboard loads |
| `sp_ToggleSubscription` | User subscribes / unsubscribes |

### Triggers (4)
| Trigger | Event | Effect |
|---|---|---|
| `trg_NotifyOnUpload` | AFTER INSERT on video | Notifies all subscribers |
| `trg_AfterVideoPublished` | AFTER INSERT on video | Notifies subscribers (Published only) |
| `trg_UpdateCreatorViews` | AFTER UPDATE on video | Keeps creator TotalViews in sync |
| `trg_AfterVideoDelete` | AFTER DELETE on video | Recalculates creator TotalViews |

---

## Project Structure

```
Binge/
├── app.js                   # Express app entry point
├── config/
│   ├── db.js                # MySQL connection (singleton)
│   ├── Database.js          # Database class wrapper
│   ├── Logger.js            # Logger class (singleton, writes to logs/)
│   ├── Validator.js         # Input validation utility class
│   ├── FileUploader.js      # Multer upload config class
│   └── upload.js            # Multer instance
├── controllers/
│   ├── authController.js    # Register, login, logout, change password
│   ├── viewerController.js  # Home, watch, like, subscribe, playlists, history
│   ├── creatorController.js # Dashboard, upload, edit, delete, profile
│   ├── adminController.js   # Admin dashboard, user/video/report management
│   └── reportController.js  # 10 PDF report generators
├── models/
│   ├── User.js
│   ├── Creator.js
│   ├── Video.js
│   ├── Comment.js
│   ├── Subscription.js
│   ├── WatchHistory.js
│   ├── Playlist.js
│   ├── Report.js
│   ├── Advertisement.js
│   └── RevenueLog.js
├── routes/
│   ├── authRoutes.js
│   ├── viewerRoutes.js
│   ├── creatorRoutes.js
│   ├── adminRoutes.js
│   └── reportRoutes.js
├── views/
│   ├── login.ejs
│   ├── register.ejs
│   ├── viewer/              # home, watch, subscriptions, history, playlists, profile, channel
│   ├── creator/             # dashboard, upload, profile
│   └── admin/               # dashboard, reports
├── public/
│   ├── uploads/             # Uploaded avatars (Multer)
│   └── css/
├── db/
│   └── schema.sql           # Full schema: tables, views, procedures, triggers, seed data
├── services/
│   └── PDFReportBuilder.js  # PDF generation helper class
└── logs/                    # Logger output files
```

---

## Setup & Installation

### Prerequisites
- Node.js v18+
- MySQL 8.0+
- A MySQL client (MySQL Workbench, phpMyAdmin, or CLI)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/binge.git
cd binge
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the database

Create a database named `bingedb` in MySQL, then import the backup script:

```bash
mysql -u root -p bingedb < "Binge Script.sql"
```

Or open `Binge Script.sql` in MySQL Workbench and run it against `bingedb`.

> The script includes all tables, seed data, views, stored procedures, and triggers.

### 4. Configure environment

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bingedb
SESSION_SECRET=your_secret_key
PORT=3000
```

### 5. Run the app
```bash
node app.js
```

Visit `http://localhost:3000`

---

## Default Accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@binge.com | admin123 |
| Creator | mrwtb@binge.com | 1234 |
| Viewer | gg@gmail.com | 1234 |

---

## PDF Reports

The admin panel includes 10 downloadable PDF reports:

1. Trending Videos
2. Creator Stats
3. Category Engagement
4. Video Engagement Score
5. Monthly Watch Summary
6. All Users (Activity)
7. All Videos
8. Comment Activity
9. Subscription Report
10. Content Moderation

Reports are generated on-the-fly using PDFKit and streamed directly to the browser.

---

## Academic Requirements Fulfilled

| # | Requirement | Implementation |
|---|---|---|
| 1 | Minimum 10 tables | 16 tables |
| 2 | Primary keys on all tables | ✅ Named PKs on all 16 |
| 3 | Foreign key constraints | ✅ Named FKs with CASCADE rules |
| 4 | Unique constraints | ✅ UQ on email, channel name, subscription, etc. |
| 5 | Check constraints | ✅ 20+ named CHK constraints |
| 6 | At least 5 views | 7 views, all actively used |
| 7 | At least 3 stored procedures | 3 SPs, all called from Node.js |
| 8 | At least 2 triggers | 4 triggers |
| 9 | Transactions | `editVideo` and `sp_ToggleSubscription` use transactions |
| 10 | ES6 classes | `Logger`, `Validator`, `Database`, `FileUploader`, `PDFReportBuilder`, all 10 models |
| 11 | Singleton pattern | `Logger` and `db` connection exported as singletons |
| 12 | File uploads | Multer — avatar upload for users and creators |
| 13 | PDF generation | PDFKit — 10 admin reports |
| 14 | Password hashing | bcryptjs on register and password change |
| 15 | Session management | express-session with role-based route protection |
| 16 | Input validation | `Validator` class used in auth and video upload |

---

## License

This project was built as a final project for the Data Structures Lab course (2nd Semester).
