-- ============================================================
--  Binge Platform — Complete Database Schema
--  Includes: 16 tables, 25+ constraints, 5 views,
--            3 stored procedures, 2 triggers
-- ============================================================

DROP DATABASE IF EXISTS BingeDB;
CREATE DATABASE BingeDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE BingeDB;

-- ============================================================
--  TABLE 1: user
-- ============================================================
CREATE TABLE user (
    Id          INT             NOT NULL AUTO_INCREMENT,
    FirstName   VARCHAR(100)    NOT NULL,
    LastName    VARCHAR(100)    NOT NULL,
    Email       VARCHAR(150)    NOT NULL UNIQUE,
    Password    VARCHAR(255)    NOT NULL,
    Country     VARCHAR(100)    DEFAULT 'Pakistan',
    Avatar      VARCHAR(255)    DEFAULT NULL,
    JoinDate    DATE            NOT NULL DEFAULT (CURRENT_DATE),
    Status      VARCHAR(50)     NOT NULL DEFAULT 'Active',
    CONSTRAINT PK_User          PRIMARY KEY (Id),
    CONSTRAINT CHK_User_Status  CHECK (Status IN ('Active', 'Suspended', 'Banned', 'Inactive'))
);

-- ============================================================
--  TABLE 2: creator
-- ============================================================
CREATE TABLE creator (
    Id                  INT             NOT NULL AUTO_INCREMENT,
    UserId              INT             NOT NULL UNIQUE,
    ChannelName         VARCHAR(150)    NOT NULL UNIQUE,
    Bio                 VARCHAR(500),
    BannerUrl           VARCHAR(300),
    TotalSubscribers    INT             NOT NULL DEFAULT 0,
    TotalViews          INT             NOT NULL DEFAULT 0,
    CONSTRAINT PK_Creator           PRIMARY KEY (Id),
    CONSTRAINT FK_Creator_User      FOREIGN KEY (UserId)    REFERENCES user(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Creator_Subs     CHECK (TotalSubscribers >= 0),
    CONSTRAINT CHK_Creator_Views    CHECK (TotalViews >= 0)
);

-- ============================================================
--  TABLE 3: category
-- ============================================================
CREATE TABLE category (
    Id          INT             NOT NULL AUTO_INCREMENT,
    Name        VARCHAR(100)    NOT NULL UNIQUE,
    Description VARCHAR(300),
    DateCreated DATE            NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT PK_Category PRIMARY KEY (Id)
);

-- ============================================================
--  TABLE 4: tag
-- ============================================================
CREATE TABLE tag (
    Id      INT             NOT NULL AUTO_INCREMENT,
    Name    VARCHAR(100)    NOT NULL UNIQUE,
    CONSTRAINT PK_Tag PRIMARY KEY (Id)
);

-- ============================================================
--  TABLE 5: video
-- ============================================================
CREATE TABLE video (
    Id          INT             NOT NULL AUTO_INCREMENT,
    CreatorId   INT             NOT NULL,
    CategoryId  INT             NOT NULL,
    Title       VARCHAR(200)    NOT NULL,
    Description TEXT,
    VideoUrl    VARCHAR(300)    NOT NULL,
    Duration    INT             NOT NULL,
    Views       INT             NOT NULL DEFAULT 0,
    Status      VARCHAR(50)     NOT NULL DEFAULT 'Published',
    UploadDate  DATE            NOT NULL DEFAULT (CURRENT_DATE),
    CONSTRAINT PK_Video             PRIMARY KEY (Id),
    CONSTRAINT FK_Video_Creator     FOREIGN KEY (CreatorId)     REFERENCES creator(Id)  ON DELETE CASCADE,
    CONSTRAINT FK_Video_Category    FOREIGN KEY (CategoryId)    REFERENCES category(Id),
    CONSTRAINT CHK_Video_Duration   CHECK (Duration > 0),
    CONSTRAINT CHK_Video_Views      CHECK (Views >= 0),
    CONSTRAINT CHK_Video_Status     CHECK (Status IN ('Published', 'Private', 'Unlisted', 'Draft', 'Removed'))
);

-- ============================================================
--  TABLE 6: videotag  (junction — Video M:M Tag)
-- ============================================================
CREATE TABLE videotag (
    VideoId INT NOT NULL,
    TagId   INT NOT NULL,
    CONSTRAINT PK_VideoTag          PRIMARY KEY (VideoId, TagId),
    CONSTRAINT FK_VideoTag_Video    FOREIGN KEY (VideoId)   REFERENCES video(Id) ON DELETE CASCADE,
    CONSTRAINT FK_VideoTag_Tag      FOREIGN KEY (TagId)     REFERENCES tag(Id)   ON DELETE CASCADE
);

-- ============================================================
--  TABLE 7: comment
-- ============================================================
CREATE TABLE comment (
    Id                INT          NOT NULL AUTO_INCREMENT,
    VideoId           INT          NOT NULL,
    UserId            INT          NOT NULL,
    Content           TEXT         NOT NULL,
    LikeCount         INT          NOT NULL DEFAULT 0,
    CommentDate       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ParentCommentId   INT                   DEFAULT NULL,
    CONSTRAINT PK_Comment               PRIMARY KEY (Id),
    CONSTRAINT FK_Comment_Video         FOREIGN KEY (VideoId)           REFERENCES video(Id)    ON DELETE CASCADE,
    CONSTRAINT FK_Comment_User          FOREIGN KEY (UserId)            REFERENCES user(Id)     ON DELETE CASCADE,
    CONSTRAINT FK_Comment_Parent        FOREIGN KEY (ParentCommentId)   REFERENCES comment(Id)  ON DELETE SET NULL,
    CONSTRAINT CHK_Comment_LikeCount    CHECK (LikeCount >= 0)
);

-- ============================================================
--  TABLE 8: likes
-- ============================================================
CREATE TABLE likes (
    Id          INT         NOT NULL AUTO_INCREMENT,
    VideoId     INT         NOT NULL,
    UserId      INT         NOT NULL,
    LikedAt     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Like       PRIMARY KEY (Id),
    CONSTRAINT UQ_Like       UNIQUE (VideoId, UserId),
    CONSTRAINT FK_Like_Video FOREIGN KEY (VideoId)  REFERENCES video(Id) ON DELETE CASCADE,
    CONSTRAINT FK_Like_User  FOREIGN KEY (UserId)   REFERENCES user(Id)  ON DELETE CASCADE
);

-- ============================================================
--  TABLE 9: subscription
-- ============================================================
CREATE TABLE subscription (
    Id              INT         NOT NULL AUTO_INCREMENT,
    ViewerId        INT         NOT NULL,
    CreatorId       INT         NOT NULL,
    SubscribedAt    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    NotifyEnabled   TINYINT(1)  NOT NULL DEFAULT 1,
    CONSTRAINT PK_Subscription          PRIMARY KEY (Id),
    CONSTRAINT UQ_Subscription          UNIQUE (ViewerId, CreatorId),
    CONSTRAINT FK_Subscription_Viewer   FOREIGN KEY (ViewerId)  REFERENCES user(Id)    ON DELETE CASCADE,
    CONSTRAINT FK_Subscription_Creator  FOREIGN KEY (CreatorId) REFERENCES creator(Id) ON DELETE CASCADE
);

-- ============================================================
--  TABLE 10: watchhistory
-- ============================================================
CREATE TABLE watchhistory (
    Id                  INT             NOT NULL AUTO_INCREMENT,
    UserId              INT             NOT NULL,
    VideoId             INT             NOT NULL,
    WatchedAt           DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    WatchDuration       INT             NOT NULL DEFAULT 0,
    CompletionPercent   DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    CONSTRAINT PK_WatchHistory              PRIMARY KEY (Id),
    CONSTRAINT FK_WatchHistory_User         FOREIGN KEY (UserId)    REFERENCES user(Id)  ON DELETE CASCADE,
    CONSTRAINT FK_WatchHistory_Video        FOREIGN KEY (VideoId)   REFERENCES video(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_WatchHistory_Completion  CHECK (CompletionPercent BETWEEN 0 AND 100),
    CONSTRAINT CHK_WatchHistory_Duration    CHECK (WatchDuration >= 0)
);

-- ============================================================
--  TABLE 11: playlist
-- ============================================================
CREATE TABLE playlist (
    Id          INT             NOT NULL AUTO_INCREMENT,
    UserId      INT             NOT NULL,
    Title       VARCHAR(200)    NOT NULL,
    Description TEXT,
    Visibility  VARCHAR(50)     NOT NULL DEFAULT 'Public',
    CreatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Playlist              PRIMARY KEY (Id),
    CONSTRAINT FK_Playlist_User         FOREIGN KEY (UserId)    REFERENCES user(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Playlist_Visibility  CHECK (Visibility IN ('Public', 'Private', 'Unlisted'))
);

-- ============================================================
--  TABLE 12: playlistitem  (junction — Playlist M:M Video)
-- ============================================================
CREATE TABLE playlistitem (
    Id          INT         NOT NULL AUTO_INCREMENT,
    PlaylistId  INT         NOT NULL,
    VideoId     INT         NOT NULL,
    AddedAt     DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    OrderNo     INT         NOT NULL DEFAULT 1,
    CONSTRAINT PK_PlaylistItem          PRIMARY KEY (Id),
    CONSTRAINT UQ_PlaylistItem          UNIQUE (PlaylistId, VideoId),
    CONSTRAINT FK_PlaylistItem_Playlist FOREIGN KEY (PlaylistId)    REFERENCES playlist(Id) ON DELETE CASCADE,
    CONSTRAINT FK_PlaylistItem_Video    FOREIGN KEY (VideoId)       REFERENCES video(Id)    ON DELETE CASCADE,
    CONSTRAINT CHK_PlaylistItem_Order   CHECK (OrderNo > 0)
);

-- ============================================================
--  TABLE 13: notification
-- ============================================================
CREATE TABLE notification (
    Id          INT             NOT NULL AUTO_INCREMENT,
    UserId      INT             NOT NULL,
    Message     VARCHAR(300)    NOT NULL,
    IsRead      TINYINT(1)      NOT NULL DEFAULT 0,
    CreatedAt   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Type        VARCHAR(50)     NOT NULL DEFAULT 'General',
    CONSTRAINT PK_Notification          PRIMARY KEY (Id),
    CONSTRAINT FK_Notification_User     FOREIGN KEY (UserId)    REFERENCES user(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Notification_Type    CHECK (Type IN ('General', 'NewVideo', 'Comment', 'Like', 'Subscription', 'System'))
);

-- ============================================================
--  TABLE 14: report
-- ============================================================
CREATE TABLE report (
    Id          INT             NOT NULL AUTO_INCREMENT,
    ReportedBy  INT             NOT NULL,
    VideoId     INT             NOT NULL,
    Reason      VARCHAR(200)    NOT NULL,
    Status      VARCHAR(50)     NOT NULL DEFAULT 'Pending',
    ReportedAt  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT PK_Report            PRIMARY KEY (Id),
    CONSTRAINT FK_Report_User       FOREIGN KEY (ReportedBy)    REFERENCES user(Id)  ON DELETE CASCADE,
    CONSTRAINT FK_Report_Video      FOREIGN KEY (VideoId)       REFERENCES video(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Report_Status    CHECK (Status IN ('Pending', 'Reviewed', 'Dismissed', 'ActionTaken'))
);

-- ============================================================
--  TABLE 15: advertisement
-- ============================================================
CREATE TABLE advertisement (
    Id          INT             NOT NULL AUTO_INCREMENT,
    CreatorId   INT             NOT NULL,
    Title       VARCHAR(200)    NOT NULL,
    Budget      DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    StartDate   DATE            NOT NULL,
    EndDate     DATE            NOT NULL,
    Status      VARCHAR(50)     NOT NULL DEFAULT 'Active',
    CONSTRAINT PK_Advertisement             PRIMARY KEY (Id),
    CONSTRAINT FK_Advertisement_Creator     FOREIGN KEY (CreatorId) REFERENCES creator(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_Advertisement_Budget     CHECK (Budget >= 0),
    CONSTRAINT CHK_Advertisement_Dates      CHECK (EndDate > StartDate),
    CONSTRAINT CHK_Advertisement_Status     CHECK (Status IN ('Active', 'Paused', 'Completed', 'Cancelled'))
);

-- ============================================================
--  TABLE 16: revenuelog
-- ============================================================
CREATE TABLE revenuelog (
    Id                  INT             NOT NULL AUTO_INCREMENT,
    CreatorId           INT             NOT NULL,
    Month               INT             NOT NULL,
    Year                INT             NOT NULL,
    TotalViews          INT             NOT NULL DEFAULT 0,
    EstimatedRevenue    DECIMAL(12,2)   NOT NULL DEFAULT 0.00,
    CONSTRAINT PK_RevenueLog            PRIMARY KEY (Id),
    CONSTRAINT UQ_RevenueLog            UNIQUE (CreatorId, Month, Year),
    CONSTRAINT FK_RevenueLog_Creator    FOREIGN KEY (CreatorId)     REFERENCES creator(Id) ON DELETE CASCADE,
    CONSTRAINT CHK_RevenueLog_Month     CHECK (Month BETWEEN 1 AND 12),
    CONSTRAINT CHK_RevenueLog_Year      CHECK (Year >= 2020),
    CONSTRAINT CHK_RevenueLog_Revenue   CHECK (EstimatedRevenue >= 0),
    CONSTRAINT CHK_RevenueLog_Views     CHECK (TotalViews >= 0)
);


-- ============================================================
--  VIEWS  (5 required — 5 defined)
-- ============================================================

-- View 1: Category engagement — total videos, views, and likes per category
CREATE OR REPLACE VIEW vw_TopCategories AS
SELECT
    cat.Name,
    COUNT(DISTINCT v.Id)      AS TotalVideos,
    COALESCE(SUM(v.Views), 0) AS TotalViews,
    COUNT(DISTINCT l.Id)      AS TotalLikes
FROM category cat
LEFT JOIN video v ON v.CategoryId = cat.Id
LEFT JOIN likes l ON l.VideoId    = v.Id
GROUP BY cat.Id, cat.Name
ORDER BY TotalViews DESC;

-- View 2: Per-video engagement score (views + likes + comments weighted)
CREATE OR REPLACE VIEW vw_VideoEngagement AS
SELECT
    v.Id,
    v.Title,
    c.ChannelName,
    v.Views,
    COUNT(DISTINCT l.Id)   AS Likes,
    COUNT(DISTINCT cm.Id)  AS Comments,
    ROUND(COALESCE(AVG(wh.CompletionPercent), 0), 2) AS AvgCompletion,
    ROUND((v.Views * 0.5) + (COUNT(DISTINCT l.Id) * 2) + (COUNT(DISTINCT cm.Id) * 3), 2) AS EngagementScore
FROM video v
JOIN creator c          ON v.CreatorId  = c.Id
LEFT JOIN likes l       ON l.VideoId    = v.Id
LEFT JOIN comment cm    ON cm.VideoId   = v.Id
LEFT JOIN watchhistory wh ON wh.VideoId = v.Id
GROUP BY v.Id, v.Title, c.ChannelName, v.Views;

-- View 3: Monthly watch activity summary
CREATE OR REPLACE VIEW vw_MonthlyWatchSummary AS
SELECT
    MONTH(WatchedAt)                 AS Month,
    YEAR(WatchedAt)                  AS Year,
    COUNT(*)                         AS TotalWatches,
    COUNT(DISTINCT UserId)           AS UniqueViewers,
    COUNT(DISTINCT VideoId)          AS UniqueVideos,
    ROUND(AVG(CompletionPercent), 2) AS AvgCompletion
FROM watchhistory
GROUP BY YEAR(WatchedAt), MONTH(WatchedAt)
ORDER BY Year DESC, Month DESC;

-- View 4: Comprehensive creator channel statistics
CREATE OR REPLACE VIEW vw_CreatorStats AS
SELECT
    c.Id,
    c.ChannelName,
    c.TotalSubscribers,
    c.TotalViews,
    u.Email,
    u.Country,
    u.Status                         AS UserStatus,
    COUNT(DISTINCT v.Id)             AS PublishedVideos,
    COUNT(DISTINCT s.Id)             AS ActiveSubscribers,
    COALESCE(SUM(v.Views), 0)        AS RealTotalViews,
    COALESCE(SUM(rl.EstimatedRevenue), 0) AS TotalRevenue
FROM creator c
JOIN user u                  ON c.UserId    = u.Id
LEFT JOIN video v            ON v.CreatorId = c.Id AND v.Status = 'Published'
LEFT JOIN subscription s     ON s.CreatorId = c.Id
LEFT JOIN revenuelog rl      ON rl.CreatorId = c.Id
GROUP BY c.Id, c.ChannelName, c.TotalSubscribers, c.TotalViews,
         u.Email, u.Country, u.Status;

-- View 5: User activity summary (watches, comments, likes, subscriptions)
CREATE OR REPLACE VIEW vw_UserActivity AS
SELECT
    u.Id,
    u.FirstName,
    u.LastName,
    u.Email,
    u.Country,
    u.Status,
    u.JoinDate,
    COUNT(DISTINCT wh.Id) AS VideosWatched,
    COUNT(DISTINCT cm.Id) AS CommentsMade,
    COUNT(DISTINCT l.Id)  AS LikesGiven,
    COUNT(DISTINCT s.Id)  AS Subscriptions,
    MAX(wh.WatchedAt)     AS LastActive
FROM user u
LEFT JOIN watchhistory wh ON wh.UserId  = u.Id
LEFT JOIN comment cm      ON cm.UserId  = u.Id
LEFT JOIN likes l         ON l.UserId   = u.Id
LEFT JOIN subscription s  ON s.ViewerId = u.Id
GROUP BY u.Id, u.FirstName, u.LastName, u.Email, u.Country, u.Status, u.JoinDate;


-- ============================================================
--  STORED PROCEDURES  (3 required — 3 defined)
-- ============================================================

DROP PROCEDURE IF EXISTS sp_UploadVideo;
DELIMITER //
-- SP 1: Insert a video row atomically and return its new Id.
CREATE PROCEDURE sp_UploadVideo(
    IN  p_CreatorId   INT,
    IN  p_CategoryId  INT,
    IN  p_Title       VARCHAR(200),
    IN  p_Description TEXT,
    IN  p_VideoUrl    VARCHAR(300),
    IN  p_Duration    INT,
    IN  p_Status      VARCHAR(50),
    OUT p_VideoId     INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_VideoId = -1;
        RESIGNAL;
    END;

    START TRANSACTION;

    INSERT INTO video (CreatorId, CategoryId, Title, Description, VideoUrl, Duration, Views, Status)
    VALUES (p_CreatorId, p_CategoryId, p_Title, p_Description, p_VideoUrl, p_Duration, 0, p_Status);

    SET p_VideoId = LAST_INSERT_ID();

    COMMIT;
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS sp_ToggleSubscription;
DELIMITER //
-- SP 2: Subscribe or unsubscribe atomically, keeping TotalSubscribers in sync.
CREATE PROCEDURE sp_ToggleSubscription(
    IN  p_ViewerId  INT,
    IN  p_CreatorId INT,
    OUT p_Action    VARCHAR(20)
)
BEGIN
    DECLARE v_exists INT DEFAULT 0;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    SELECT COUNT(*) INTO v_exists
    FROM subscription
    WHERE ViewerId = p_ViewerId AND CreatorId = p_CreatorId;

    START TRANSACTION;

    IF v_exists > 0 THEN
        DELETE FROM subscription
        WHERE ViewerId = p_ViewerId AND CreatorId = p_CreatorId;

        UPDATE creator
        SET TotalSubscribers = GREATEST(0, TotalSubscribers - 1)
        WHERE Id = p_CreatorId;

        SET p_Action = 'unsubscribed';
    ELSE
        INSERT INTO subscription (ViewerId, CreatorId, NotifyEnabled)
        VALUES (p_ViewerId, p_CreatorId, 1);

        UPDATE creator
        SET TotalSubscribers = TotalSubscribers + 1
        WHERE Id = p_CreatorId;

        SET p_Action = 'subscribed';
    END IF;

    COMMIT;
END //
DELIMITER ;


DROP PROCEDURE IF EXISTS sp_GetCreatorStats;
DELIMITER //
-- SP 3: Return aggregated dashboard statistics for a creator.
CREATE PROCEDURE sp_GetCreatorStats(IN p_CreatorId INT)
BEGIN
    SELECT
        COUNT(DISTINCT v.Id)                                         AS TotalVideos,
        COALESCE(SUM(v.Views), 0)                                    AS TotalViews,
        COUNT(DISTINCT l.Id)                                         AS TotalLikes,
        SUM(CASE WHEN v.Status = 'Published' THEN 1 ELSE 0 END)      AS PublishedVideos,
        c.TotalSubscribers                                           AS Subscribers,
        COALESCE(SUM(rl.EstimatedRevenue), 0)                        AS TotalRevenue
    FROM creator c
    LEFT JOIN video v      ON v.CreatorId  = c.Id
    LEFT JOIN likes l      ON l.VideoId    = v.Id
    LEFT JOIN revenuelog rl ON rl.CreatorId = c.Id
    WHERE c.Id = p_CreatorId
    GROUP BY c.Id, c.TotalSubscribers;
END //
DELIMITER ;


-- ============================================================
--  TRIGGERS  (2 required — 2 defined)
-- ============================================================

DROP TRIGGER IF EXISTS trg_AfterVideoPublished;
DELIMITER //
-- Trigger 1: When a Published video is inserted, notify all subscribers
--            of that creator via the notification table.
CREATE TRIGGER trg_AfterVideoPublished
AFTER INSERT ON video
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Published' THEN
        INSERT INTO notification (UserId, Message, Type)
        SELECT
            s.ViewerId,
            CONCAT('New video uploaded: "', NEW.Title, '"'),
            'NewVideo'
        FROM subscription s
        WHERE s.CreatorId = NEW.CreatorId
          AND s.NotifyEnabled = 1;
    END IF;
END //
DELIMITER ;


DROP TRIGGER IF EXISTS trg_AfterVideoDelete;
DELIMITER //
-- Trigger 2: When a video is deleted, recalculate the creator's TotalViews
--            from remaining videos to keep the aggregate accurate.
CREATE TRIGGER trg_AfterVideoDelete
AFTER DELETE ON video
FOR EACH ROW
BEGIN
    UPDATE creator
    SET TotalViews = (
        SELECT COALESCE(SUM(Views), 0)
        FROM video
        WHERE CreatorId = OLD.CreatorId
    )
    WHERE Id = OLD.CreatorId;
END //
DELIMITER ;


-- ============================================================
--  SEED DATA
-- ============================================================

INSERT IGNORE INTO category (Name, Description) VALUES
    ('Technology', 'Tech news, tutorials and reviews'),
    ('Gaming',     'Game playthroughs, reviews and esports'),
    ('Education',  'Courses, lectures and study content'),
    ('Music',      'Music videos, covers and live performances'),
    ('Vlogs',      'Daily life and personal vlogs'),
    ('Sports',     'Highlights, analysis and fitness'),
    ('Comedy',     'Stand-up, sketches and funny moments'),
    ('Film & TV',  'Movie reviews, trailers and TV recaps'),
    ('Science',    'Experiments, documentaries and explainers'),
    ('Travel',     'Destinations, guides and travel diaries');

INSERT IGNORE INTO tag (Name) VALUES
    ('Tutorial'), ('Review'), ('Gameplay'), ('Vlog'),
    ('Live'), ('Short'), ('Documentary'), ('How-To'),
    ('Trending'), ('New Release');


-- ============================================================
--  VERIFY
-- ============================================================
SELECT 'BingeDB schema created successfully!' AS Status;
SELECT TABLE_NAME
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'BingeDB'
ORDER BY TABLE_NAME;
