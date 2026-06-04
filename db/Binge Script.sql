-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: bingedb
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `advertisement`
--

DROP TABLE IF EXISTS `advertisement`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `advertisement` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreatorId` int NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Budget` decimal(12,2) NOT NULL DEFAULT '0.00',
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  PRIMARY KEY (`Id`),
  KEY `FK_Advertisement_Creator` (`CreatorId`),
  CONSTRAINT `FK_Advertisement_Creator` FOREIGN KEY (`CreatorId`) REFERENCES `creator` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Advertisement_Budget` CHECK ((`Budget` >= 0)),
  CONSTRAINT `CHK_Advertisement_Dates` CHECK ((`EndDate` > `StartDate`)),
  CONSTRAINT `CHK_Advertisement_Status` CHECK ((`Status` in (_utf8mb4'Active',_utf8mb4'Paused',_utf8mb4'Completed',_utf8mb4'Cancelled')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `advertisement`
--

LOCK TABLES `advertisement` WRITE;
/*!40000 ALTER TABLE `advertisement` DISABLE KEYS */;
/*!40000 ALTER TABLE `advertisement` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` varchar(300) DEFAULT NULL,
  `DateCreated` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'Technology','Videos about tech, gadgets and software','2026-05-07'),(2,'Education','Tutorials, lectures and learning content','2026-05-07'),(3,'Gaming','Game reviews, walkthroughs and streams','2026-05-07'),(4,'Music','Songs, covers and music videos','2026-05-07'),(5,'Vlogs','Daily life and personal vlogs','2026-05-07'),(6,'Sports','Sports highlights and analysis','2026-05-07'),(7,'Comedy','Funny videos and sketches','2026-05-07');
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `comment` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `VideoId` int NOT NULL,
  `UserId` int NOT NULL,
  `Content` text NOT NULL,
  `LikeCount` int NOT NULL DEFAULT '0',
  `CommentDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ParentCommentId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `FK_Comment_Video` (`VideoId`),
  KEY `FK_Comment_User` (`UserId`),
  KEY `FK_Comment_Parent` (`ParentCommentId`),
  CONSTRAINT `FK_Comment_Parent` FOREIGN KEY (`ParentCommentId`) REFERENCES `comment` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `FK_Comment_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Comment_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Comment_LikeCount` CHECK ((`LikeCount` >= 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `creator`
--

DROP TABLE IF EXISTS `creator`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `creator` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `ChannelName` varchar(150) NOT NULL,
  `Bio` varchar(500) DEFAULT NULL,
  `BannerUrl` varchar(300) DEFAULT NULL,
  `TotalSubscribers` int NOT NULL DEFAULT '0',
  `TotalViews` int NOT NULL DEFAULT '0',
  `BannerImage` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UserId` (`UserId`),
  UNIQUE KEY `ChannelName` (`ChannelName`),
  CONSTRAINT `FK_Creator_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Creator_Subs` CHECK ((`TotalSubscribers` >= 0)),
  CONSTRAINT `CHK_Creator_Views` CHECK ((`TotalViews` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `creator`
--

LOCK TABLES `creator` WRITE;
/*!40000 ALTER TABLE `creator` DISABLE KEYS */;
INSERT INTO `creator` VALUES (1,100,'Mrwhosetheboss','Making the most fun and useful tech videos on the planet',NULL,12288957,109000000,NULL),(2,101,'CoryxKenshin','Gaming videos with the biggest smile on YouTube',NULL,20370261,127500000,NULL),(3,102,'KendrickLamarVEVO','Official Kendrick Lamar music videos and content',NULL,1738295,2070000002,NULL),(4,103,'Tampad','Best sports moments and football highlights',NULL,11137431,99700002,NULL),(5,104,'CarryMinati','Roasts, gaming and entertainment from India',NULL,15477164,589000005,NULL),(6,105,'Hassan Junejo','Pakistani lifestyle vlogs and travel content',NULL,9184179,61900003,NULL),(7,106,'CodeWithHarry','Programming tutorials in Hindi and English',NULL,1662527,66100012,NULL),(8,108,'Ggnopp','seems legit',NULL,1,4,NULL);
/*!40000 ALTER TABLE `creator` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `likes`
--

DROP TABLE IF EXISTS `likes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `likes` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `VideoId` int NOT NULL,
  `UserId` int NOT NULL,
  `LikedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Like` (`VideoId`,`UserId`),
  KEY `FK_Like_User` (`UserId`),
  CONSTRAINT `FK_Like_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Like_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `likes`
--

LOCK TABLES `likes` WRITE;
/*!40000 ALTER TABLE `likes` DISABLE KEYS */;
/*!40000 ALTER TABLE `likes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Message` varchar(300) NOT NULL,
  `IsRead` tinyint(1) NOT NULL DEFAULT '0',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Type` varchar(50) NOT NULL DEFAULT 'General',
  PRIMARY KEY (`Id`),
  KEY `FK_Notification_User` (`UserId`),
  CONSTRAINT `FK_Notification_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Notification_Type` CHECK ((`Type` in (_utf8mb4'General',_utf8mb4'NewVideo',_utf8mb4'Comment',_utf8mb4'Like',_utf8mb4'Subscription',_utf8mb4'System')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Description` text,
  `Visibility` varchar(50) NOT NULL DEFAULT 'Public',
  `CreatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_Playlist_User` (`UserId`),
  CONSTRAINT `FK_Playlist_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Playlist_Visibility` CHECK ((`Visibility` in (_utf8mb4'Public',_utf8mb4'Private',_utf8mb4'Unlisted')))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist`
--

LOCK TABLES `playlist` WRITE;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
INSERT INTO `playlist` VALUES (1,1,'Workout','hehe','Public','2026-05-12 09:40:15'),(2,107,'hehe','','Public','2026-05-21 21:03:12');
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlistitem`
--

DROP TABLE IF EXISTS `playlistitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlistitem` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `PlaylistId` int NOT NULL,
  `VideoId` int NOT NULL,
  `AddedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `OrderNo` int NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_PlaylistItem` (`PlaylistId`,`VideoId`),
  KEY `FK_PlaylistItem_Video` (`VideoId`),
  CONSTRAINT `FK_PlaylistItem_Playlist` FOREIGN KEY (`PlaylistId`) REFERENCES `playlist` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_PlaylistItem_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_PlaylistItem_Order` CHECK ((`OrderNo` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlistitem`
--

LOCK TABLES `playlistitem` WRITE;
/*!40000 ALTER TABLE `playlistitem` DISABLE KEYS */;
INSERT INTO `playlistitem` VALUES (1,2,69,'2026-05-22 05:02:18',1),(2,2,53,'2026-05-22 05:02:35',2);
/*!40000 ALTER TABLE `playlistitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report`
--

DROP TABLE IF EXISTS `report`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ReportedBy` int NOT NULL,
  `VideoId` int NOT NULL,
  `Reason` varchar(200) NOT NULL,
  `Status` varchar(50) NOT NULL DEFAULT 'Pending',
  `ReportedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `FK_Report_User` (`ReportedBy`),
  KEY `FK_Report_Video` (`VideoId`),
  CONSTRAINT `FK_Report_User` FOREIGN KEY (`ReportedBy`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Report_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Report_Status` CHECK ((`Status` in (_utf8mb4'Pending',_utf8mb4'Reviewed',_utf8mb4'Dismissed',_utf8mb4'ActionTaken')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report`
--

LOCK TABLES `report` WRITE;
/*!40000 ALTER TABLE `report` DISABLE KEYS */;
/*!40000 ALTER TABLE `report` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `revenuelog`
--

DROP TABLE IF EXISTS `revenuelog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `revenuelog` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreatorId` int NOT NULL,
  `Month` int NOT NULL,
  `Year` int NOT NULL,
  `TotalViews` int NOT NULL DEFAULT '0',
  `EstimatedRevenue` decimal(12,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_RevenueLog` (`CreatorId`,`Month`,`Year`),
  CONSTRAINT `FK_RevenueLog_Creator` FOREIGN KEY (`CreatorId`) REFERENCES `creator` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_RevenueLog_Month` CHECK ((`Month` between 1 and 12)),
  CONSTRAINT `CHK_RevenueLog_Revenue` CHECK ((`EstimatedRevenue` >= 0)),
  CONSTRAINT `CHK_RevenueLog_Views` CHECK ((`TotalViews` >= 0)),
  CONSTRAINT `CHK_RevenueLog_Year` CHECK ((`Year` >= 2020))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `revenuelog`
--

LOCK TABLES `revenuelog` WRITE;
/*!40000 ALTER TABLE `revenuelog` DISABLE KEYS */;
/*!40000 ALTER TABLE `revenuelog` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `ViewerId` int NOT NULL,
  `CreatorId` int NOT NULL,
  `SubscribedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `NotifyEnabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UQ_Subscription` (`ViewerId`,`CreatorId`),
  KEY `FK_Subscription_Creator` (`CreatorId`),
  CONSTRAINT `FK_Subscription_Creator` FOREIGN KEY (`CreatorId`) REFERENCES `creator` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_Subscription_Viewer` FOREIGN KEY (`ViewerId`) REFERENCES `user` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
INSERT INTO `subscription` VALUES (1,107,7,'2026-05-22 05:02:11',1),(2,107,6,'2026-05-22 05:02:31',1),(3,107,5,'2026-05-22 05:02:57',1),(4,107,8,'2026-05-22 20:13:51',1);
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tag`
--

DROP TABLE IF EXISTS `tag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tag` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tag`
--

LOCK TABLES `tag` WRITE;
/*!40000 ALTER TABLE `tag` DISABLE KEYS */;
INSERT INTO `tag` VALUES (3,'gameplay'),(8,'howto'),(6,'pakistan'),(2,'review'),(7,'shorts'),(5,'trending'),(1,'tutorial'),(4,'unboxing');
/*!40000 ALTER TABLE `tag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `FirstName` varchar(100) NOT NULL,
  `LastName` varchar(100) NOT NULL,
  `Email` varchar(150) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `Country` varchar(100) DEFAULT 'Pakistan',
  `JoinDate` date NOT NULL DEFAULT (curdate()),
  `Status` varchar(50) NOT NULL DEFAULT 'Active',
  `Avatar` varchar(300) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Email` (`Email`),
  CONSTRAINT `CHK_User_Status` CHECK ((`Status` in (_utf8mb4'Active',_utf8mb4'Suspended',_utf8mb4'Banned',_utf8mb4'Inactive')))
) ENGINE=InnoDB AUTO_INCREMENT=109 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (4,'Admin','Binge','admin@binge.com','$2b$10$GJRmUPG8.Em2gH208DuWIOtlS9dsM1mKlTTsx60JFghERbLxzT2eG','Pakistan','2026-05-07','Active',NULL),(100,'Arun','Maini','mrwtb@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','UK','2026-05-18','Active',NULL),(101,'Cory','Williams','cory@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','USA','2026-05-18','Active',NULL),(102,'Kendrick','Lamar','kendrick@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','USA','2026-05-18','Active',NULL),(103,'Mooro','Tampad','tampad@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','UK','2026-05-18','Active',NULL),(104,'Ajey','Nagar','carry@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','India','2026-05-18','Active',NULL),(105,'Hassan','Junejo','junejo@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','Pakistan','2026-05-18','Active',NULL),(106,'Harry','Bhai','harry@binge.com','$2b$10$rxD4x1JurPiPj1QoqC6DGu8mv5zq./Z5JPoxsf8SF1Eg2nU1/tx1.','India','2026-05-18','Active',NULL),(107,'GG','pp','gg@gmail.com','$2b$10$yhitnQNaLVE2701lrAGBE.c5sRizzXqJySaBBqJLarw1j8CDHRiW6','Pakistan','2026-05-18','Active',NULL),(108,'lov','sacks','ggg@gmail.com','$2b$10$27ITvpGvKb/FhBemfD0M5OrD920piJzhR4XOnDNoe0adtlmCBGLCG','Pakistan','2026-05-22','Active','1779447327089-82599076.jpeg');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `video`
--

DROP TABLE IF EXISTS `video`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `video` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `CreatorId` int NOT NULL,
  `CategoryId` int NOT NULL,
  `Title` varchar(200) NOT NULL,
  `Description` text,
  `VideoUrl` varchar(300) NOT NULL,
  `Duration` int NOT NULL,
  `Views` int NOT NULL DEFAULT '0',
  `Status` varchar(50) NOT NULL DEFAULT 'Published',
  `UploadDate` date NOT NULL DEFAULT (curdate()),
  PRIMARY KEY (`Id`),
  KEY `FK_Video_Creator` (`CreatorId`),
  KEY `FK_Video_Category` (`CategoryId`),
  CONSTRAINT `FK_Video_Category` FOREIGN KEY (`CategoryId`) REFERENCES `category` (`Id`),
  CONSTRAINT `FK_Video_Creator` FOREIGN KEY (`CreatorId`) REFERENCES `creator` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_Video_Duration` CHECK ((`Duration` > 0)),
  CONSTRAINT `CHK_Video_Status` CHECK ((`Status` in (_utf8mb4'Published',_utf8mb4'Private',_utf8mb4'Unlisted',_utf8mb4'Draft',_utf8mb4'Removed'))),
  CONSTRAINT `CHK_Video_Views` CHECK ((`Views` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=72 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `video`
--

LOCK TABLES `video` WRITE;
/*!40000 ALTER TABLE `video` DISABLE KEYS */;
INSERT INTO `video` VALUES (1,1,1,'The Mr.Beast MEGA-STUDIO Tour.',NULL,'https://www.youtube.com/watch?v=lUzpK0tGFcE',1456,12000000,'Published','2025-05-30'),(2,1,1,'I bought the Smallest Tech in the World.',NULL,'https://www.youtube.com/watch?v=syB1ezRvKpU',743,9800000,'Published','2025-08-29'),(3,1,1,'I bought every Playstation ever.',NULL,'https://www.youtube.com/watch?v=0rCbfsuKdYw',987,7600000,'Published','2026-05-10'),(4,1,1,'I bought the THINNEST Tech of the world',NULL,'https://www.youtube.com/watch?v=nmY2kgWYwyQ',1102,14000000,'Published','2026-02-12'),(5,1,1,'How this wallpaper Kills your Phone',NULL,'https://www.youtube.com/watch?v=iXKvwPjCGnY',1345,11000000,'Published','2025-06-20'),(6,1,1,'Turn your Smartphone into a 3D Hologram',NULL,'https://www.youtube.com/watch?v=7YWTtCsvgvg',876,8900000,'Published','2025-08-13'),(7,1,1,'I bought the most FUTURISTIC Tech of the world',NULL,'https://www.youtube.com/watch?v=b0HfmY64eSE',1234,16000000,'Published','2026-03-26'),(8,1,1,'21 Horrific Tech Failures they want you to Forget.',NULL,'https://www.youtube.com/watch?v=QMWlRWnAZH8',1567,13000000,'Published','2025-07-23'),(9,1,1,'I bought the most Satisfying Tech of the world',NULL,'https://www.youtube.com/watch?v=0BR-HgA3mlo',923,10000000,'Published','2026-04-07'),(10,1,1,'I bought the Biggest Tech of the world',NULL,'https://www.youtube.com/watch?v=VuG4BcghOSg',834,6700000,'Published','2025-11-05'),(11,2,3,'THIS MAN IS FOLLOWING ME - CLOSING SHIFT',NULL,'https://www.youtube.com/watch?v=7KAcyc9aEvg',1823,18000000,'Published','2026-03-24'),(12,2,3,'SCREAMING AT A SCARY TOY FACTORY - POPPY PLAYTIME',NULL,'https://www.youtube.com/watch?v=8J_zM1zYsHg',1456,9800000,'Published','2025-12-15'),(13,2,3,'WORST JUMPSCARE IN YEARS - FEARS TO FATHOM',NULL,'https://www.youtube.com/watch?v=fgMqIlgXlyI&pp=0gcJCQQLAYcqIYzv',2100,21000000,'Published','2025-05-28'),(14,2,3,'THIS GAME IS FOR KIDS?? - AMANDA THE ADVENTURE',NULL,'https://www.youtube.com/watch?v=tiOrbqx62O4',2341,14000000,'Published','2026-03-09'),(15,2,3,'I GOT JUMP BY THE JOY GANG - DARK DECEPTION',NULL,'https://www.youtube.com/watch?v=VP6BESB8ZAQ',1678,11000000,'Published','2026-01-18'),(16,2,3,'MY PYSCHO EX-GIRLFRIEND WANTS ME DEAD - CRIMSON SNOW',NULL,'https://www.youtube.com/watch?v=Cd7HxTIZHy8',1234,16000000,'Published','2025-11-26'),(17,2,3,'SCARIED SUMMER JOB EVER - THE BATHHOUSE',NULL,'https://www.youtube.com/watch?v=7st6VbU7PoY',3456,8900000,'Published','2025-07-16'),(18,2,3,'CHOO-CHOO CHARLES WHY DID I DOWNLOAD THIS GAME',NULL,'https://www.youtube.com/watch?v=oxDhb6q9qmM',2890,12000000,'Published','2025-10-27'),(19,2,3,'THE MOST DISRESPECTFUL JUMPSCARE EVER',NULL,'https://www.youtube.com/watch?v=KZHmKPpWg2E',1876,7600000,'Published','2026-03-10'),(20,2,3,'CRAB GAME HAVE ME IN TEARS',NULL,'https://www.youtube.com/watch?v=tq5QOPi-v1U',2567,9200000,'Published','2026-01-16'),(21,3,4,'Kendrick Lamar — HUMBLE (Official Video)',NULL,'https://www.youtube.com/watch?v=tvTRZJ-4EyI',214,800000002,'Published','2026-03-17'),(22,3,4,'Kendrick Lamar — DNA (Official Video)',NULL,'https://www.youtube.com/watch?v=NLZRYQMLDW4&pp=0gcJCQQLAYcqIYzv',205,450000000,'Published','2026-03-05'),(23,3,4,'Kendrick Lamar — Not Like Us (Official Video)',NULL,'https://www.youtube.com/watch?v=T6eK-2OQtew',274,350000000,'Published','2025-05-29'),(24,3,4,'Kendrick Lamar — Swimming Pools Drank',NULL,'https://www.youtube.com/watch?v=B5YNiCfWC3A',321,280000000,'Published','2026-01-10'),(25,3,4,'Kendrick Lamar — Alright (Official Video)',NULL,'https://www.youtube.com/watch?v=Z-48u_uWMHY',248,190000000,'Published','2026-03-20'),(26,3,4,'Kendrick Lamar — LOYALTY ft Rihanna',NULL,'https://www.youtube.com/watch?v=Dlh-dzB2U4Y',223,520000000,'Published','2026-05-01'),(27,3,4,'Kendrick Lamar — King Kunta',NULL,'https://www.youtube.com/watch?v=hRK7PVJFbS8',234,180000000,'Published','2025-09-12'),(28,3,4,'Kendrick Lamar — LOVE ft Zacari',NULL,'https://www.youtube.com/watch?v=ox7RsX1Ee34&pp=0gcJCQQLAYcqIYzv',215,310000000,'Published','2026-03-22'),(29,3,4,'Kendrick Lamar, SZA — All the Stars',NULL,'https://www.youtube.com/watch?v=JQbjS0_ZfJ0',267,120000000,'Published','2025-07-11'),(30,3,4,'Kendrick Lamar — N95 (Official Video)',NULL,'https://www.youtube.com/watch?v=zI383uEwA6Q',256,95000000,'Published','2025-09-15'),(31,4,6,'AUSTRALIA VS PAKISTAN | 3rd ODI',NULL,'https://www.youtube.com/watch?v=QmbuF1-j0wQ',1876,8900000,'Published','2025-12-06'),(32,4,6,'AUSTRALIA VS PAKISTAN | 2nd ODI',NULL,'https://www.youtube.com/watch?v=-RdOEjdH3g8',2341,12000000,'Published','2026-02-26'),(33,4,6,'WEST INDIES VS PAKISTAN | 1st ODI',NULL,'https://www.youtube.com/watch?v=pE0QwBgl-LM',1456,14000000,'Published','2025-07-26'),(34,4,6,'INDIA VS ENGLAND | 5th T20i',NULL,'https://www.youtube.com/watch?v=r1VgelUBUiE',1234,7600001,'Published','2026-04-01'),(35,4,6,'WEST INDIES VS PAKISTAN | 3rd T20i',NULL,'https://www.youtube.com/watch?v=o46Tk47_O40',987,9800000,'Published','2026-02-12'),(36,4,6,'INDIA VS SOUTH AFRICA | 2nd ODI',NULL,'https://www.youtube.com/watch?v=bGz-L9D4oaE',1678,11000001,'Published','2026-02-27'),(37,4,6,'NEW ZEALAND VS INDIA | 3rd ODI',NULL,'https://www.youtube.com/watch?v=KNRQCSriq8o',2100,16000000,'Published','2025-05-27'),(38,4,6,'BANGLADESH VS WEST INDIES | 1st ODI',NULL,'https://www.youtube.com/watch?v=oxokic7ihEY',1345,6700000,'Published','2025-08-17'),(39,4,6,'AUSTRALIA VS INDIA | 2nd T20i',NULL,'https://www.youtube.com/watch?v=MkismjsCSp8',1102,8100000,'Published','2025-12-13'),(40,4,6,'BANGLADESH VS PAKISTAN | 1st T20i',NULL,'https://www.youtube.com/watch?v=NF_PG6xI8RA',1567,5600000,'Published','2026-01-27'),(41,5,7,'MR BEAST PARODY',NULL,'https://www.youtube.com/watch?v=m9s1NQG3TNY',1234,160000000,'Published','2026-02-11'),(42,5,7,'DAILY VOLGERS PARODY',NULL,'https://www.youtube.com/watch?v=5XVoRGhrhZk',267,130000001,'Published','2026-02-06'),(43,5,7,'BIG BOSS BIG BOSS BIG BOSS | ROAST ',NULL,'https://www.youtube.com/watch?v=9DAKh_XCk6g',987,45000000,'Published','2026-01-15'),(44,5,7,'THARA BHAIIIIIIIII',NULL,'https://www.youtube.com/watch?v=0jUj3rfO7eM',654,38000000,'Published','2025-10-26'),(45,5,7,'VADA PAV AUR CHAI',NULL,'https://www.youtube.com/watch?v=WX7DBPcsiEs',1102,52000000,'Published','2025-07-06'),(46,5,7,'FLIM THE FLARE',NULL,'https://www.youtube.com/watch?v=GOFQN8otiYs',876,29000001,'Published','2026-05-01'),(47,5,7,'INDIAN FOOD MAGIC',NULL,'https://www.youtube.com/watch?v=-LIMVVfRp6Q',1345,34000000,'Published','2025-09-19'),(48,5,7,'MOTIVATIONAL SPEAKER PARODY',NULL,'https://www.youtube.com/watch?v=P8P_S1Fjl_Q',923,41000000,'Published','2026-04-23'),(49,5,7,'LADIKYON KE BEST FRIEND',NULL,'https://www.youtube.com/watch?v=l6BChpns5w8',1456,27000003,'Published','2026-04-07'),(50,5,7,'MAGGIE KHAO BODY BANAO',NULL,'https://www.youtube.com/watch?v=IoTL9xZOdP0&pp=0gcJCQQLAYcqIYzv',1678,33000000,'Published','2026-02-26'),(51,6,5,'WHY I SOLD MY R1 AND GOT A CAR',NULL,'https://www.youtube.com/watch?v=xahHKydYlO4',2341,8900000,'Published','2026-02-28'),(52,6,5,'MY NEW car... is not A CAR!',NULL,'https://www.youtube.com/watch?v=rnBMXZbg6Qc',1876,6700000,'Published','2025-11-23'),(53,6,5,'MISSION BABY BULL',NULL,'https://www.youtube.com/watch?v=_GUu4ZWw8mg',2100,5400003,'Published','2026-05-12'),(54,6,5,'CHEAT DAY in Broadway',NULL,'https://www.youtube.com/watch?v=Vjf5FsjiL70',3241,7800000,'Published','2025-05-30'),(55,6,5,'BABAR AZAM in BIRMINGHAM',NULL,'https://www.youtube.com/watch?v=1eaWkcvlaaE',1456,4300000,'Published','2025-07-06'),(56,6,5,'THE STORY OF KARACHI BURGER',NULL,'https://www.youtube.com/watch?v=XDSdyeenSgw',1823,5100000,'Published','2026-02-16'),(57,6,5,'LONDON KE SHER',NULL,'https://www.youtube.com/watch?v=L0C9zh9k5yM',1987,3800000,'Published','2026-04-29'),(58,6,5,'21 DAYS without SUGAR',NULL,'https://www.youtube.com/watch?v=Zu-_UdbkXUU&pp=0gcJCQQLAYcqIYzv',1234,4600000,'Published','2025-10-25'),(59,6,5,'SMART DIRECTOR BOY',NULL,'https://www.youtube.com/watch?v=l5kzn4Fs0x4',2567,6200000,'Published','2026-04-03'),(60,6,5,'WHEN TO ACT ON IDEAS',NULL,'https://www.youtube.com/watch?v=TFij6In-6MU',1678,9100000,'Published','2025-09-04'),(61,7,2,'Python tutorial for beginners in Hindi',NULL,'https://www.youtube.com/watch?v=gfDE2a7MKjA',14400,12000000,'Published','2025-08-11'),(62,7,2,'Web development full course — Hindi',NULL,'https://www.youtube.com/watch?v=6mbwJ2xhgzM',18000,8900000,'Published','2025-12-10'),(63,7,2,'Java tutorial for beginners — Complete course',NULL,'https://www.youtube.com/watch?v=ntLJmHOJ0ME',16200,6700000,'Published','2025-05-19'),(64,7,2,'How to become a full stack developer in 2024',NULL,'https://www.youtube.com/watch?v=ysEN5RaKOlA',2341,5400000,'Published','2025-11-22'),(65,7,2,'Django tutorial for beginners — Build a website',NULL,'https://www.youtube.com/watch?v=T1intZyhXDU',7200,4300000,'Published','2025-12-13'),(66,7,2,'C++ full course for beginners — Hindi',NULL,'https://www.youtube.com/watch?v=j8nAHeVKL08',21600,7800000,'Published','2026-03-11'),(67,7,2,'JavaScript course in Hindi — Sigma batch',NULL,'https://www.youtube.com/watch?v=chx9Rs41W6g',10800,9200000,'Published','2025-05-20'),(68,7,2,'Data structures and algorithms in Python',NULL,'https://www.youtube.com/watch?v=pkYVOmU3MgA',9000,3800000,'Published','2026-03-15'),(69,7,2,'Learing Coding and Getting a JOB in 2026',NULL,'https://www.youtube.com/watch?v=YBB3GbluHjA',1876,2900012,'Published','2026-05-17'),(70,7,2,'MySQL complete tutorial for beginners',NULL,'https://www.youtube.com/watch?v=HXV3zeQKqGY',3600,5100000,'Published','2025-06-05'),(71,8,3,'BEST CLUTHES FROM VCT 2025 CHAMPIONSHIP','enjoy','https://www.youtube.com/watch?v=ZQAeYXv-ggo',950,4,'Published','2026-05-22');
/*!40000 ALTER TABLE `video` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_NotifyOnUpload` AFTER INSERT ON `video` FOR EACH ROW BEGIN
    INSERT INTO notification (UserId, Message, Type)
    SELECT
        s.ViewerId,
        CONCAT('New video: ', NEW.Title),
        'NewVideo'
    FROM subscription s
    WHERE s.CreatorId     = NEW.CreatorId
      AND s.NotifyEnabled = 1;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_AfterVideoPublished` AFTER INSERT ON `video` FOR EACH ROW BEGIN
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
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_UpdateCreatorViews` AFTER UPDATE ON `video` FOR EACH ROW BEGIN
    IF NEW.Views <> OLD.Views THEN
        UPDATE creator
        SET TotalViews = TotalViews + (NEW.Views - OLD.Views)
        WHERE Id = NEW.CreatorId;
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `trg_AfterVideoDelete` AFTER DELETE ON `video` FOR EACH ROW BEGIN
    UPDATE creator
    SET TotalViews = (
        SELECT COALESCE(SUM(Views), 0)
        FROM video
        WHERE CreatorId = OLD.CreatorId
    )
    WHERE Id = OLD.CreatorId;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `videotag`
--

DROP TABLE IF EXISTS `videotag`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `videotag` (
  `VideoId` int NOT NULL,
  `TagId` int NOT NULL,
  PRIMARY KEY (`VideoId`,`TagId`),
  KEY `FK_VideoTag_Tag` (`TagId`),
  CONSTRAINT `FK_VideoTag_Tag` FOREIGN KEY (`TagId`) REFERENCES `tag` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_VideoTag_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `videotag`
--

LOCK TABLES `videotag` WRITE;
/*!40000 ALTER TABLE `videotag` DISABLE KEYS */;
INSERT INTO `videotag` VALUES (71,3);
/*!40000 ALTER TABLE `videotag` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_creatordashboard`
--

DROP TABLE IF EXISTS `vw_creatordashboard`;
/*!50001 DROP VIEW IF EXISTS `vw_creatordashboard`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_creatordashboard` AS SELECT 
 1 AS `CreatorId`,
 1 AS `ChannelName`,
 1 AS `TotalSubscribers`,
 1 AS `TotalViews`,
 1 AS `TotalVideos`,
 1 AS `TotalLikes`,
 1 AS `TotalComments`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_creatorstats`
--

DROP TABLE IF EXISTS `vw_creatorstats`;
/*!50001 DROP VIEW IF EXISTS `vw_creatorstats`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_creatorstats` AS SELECT 
 1 AS `Id`,
 1 AS `ChannelName`,
 1 AS `TotalSubscribers`,
 1 AS `TotalViews`,
 1 AS `Email`,
 1 AS `Country`,
 1 AS `UserStatus`,
 1 AS `PublishedVideos`,
 1 AS `ActiveSubscribers`,
 1 AS `RealTotalViews`,
 1 AS `TotalRevenue`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_monthlywatchsummary`
--

DROP TABLE IF EXISTS `vw_monthlywatchsummary`;
/*!50001 DROP VIEW IF EXISTS `vw_monthlywatchsummary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_monthlywatchsummary` AS SELECT 
 1 AS `Month`,
 1 AS `Year`,
 1 AS `TotalWatches`,
 1 AS `UniqueViewers`,
 1 AS `UniqueVideos`,
 1 AS `AvgCompletion`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_topcategories`
--

DROP TABLE IF EXISTS `vw_topcategories`;
/*!50001 DROP VIEW IF EXISTS `vw_topcategories`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_topcategories` AS SELECT 
 1 AS `Name`,
 1 AS `TotalVideos`,
 1 AS `TotalViews`,
 1 AS `TotalLikes`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_trendingvideos`
--

DROP TABLE IF EXISTS `vw_trendingvideos`;
/*!50001 DROP VIEW IF EXISTS `vw_trendingvideos`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_trendingvideos` AS SELECT 
 1 AS `Id`,
 1 AS `Title`,
 1 AS `Views`,
 1 AS `UploadDate`,
 1 AS `ChannelName`,
 1 AS `Category`,
 1 AS `TotalLikes`,
 1 AS `TotalComments`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_useractivity`
--

DROP TABLE IF EXISTS `vw_useractivity`;
/*!50001 DROP VIEW IF EXISTS `vw_useractivity`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_useractivity` AS SELECT 
 1 AS `Id`,
 1 AS `FirstName`,
 1 AS `LastName`,
 1 AS `Email`,
 1 AS `Country`,
 1 AS `Status`,
 1 AS `JoinDate`,
 1 AS `VideosWatched`,
 1 AS `CommentsMade`,
 1 AS `LikesGiven`,
 1 AS `Subscriptions`,
 1 AS `LastActive`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_videoengagement`
--

DROP TABLE IF EXISTS `vw_videoengagement`;
/*!50001 DROP VIEW IF EXISTS `vw_videoengagement`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_videoengagement` AS SELECT 
 1 AS `Id`,
 1 AS `Title`,
 1 AS `ChannelName`,
 1 AS `Views`,
 1 AS `Likes`,
 1 AS `Comments`,
 1 AS `AvgCompletion`,
 1 AS `EngagementScore`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `watchhistory`
--

DROP TABLE IF EXISTS `watchhistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `watchhistory` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `VideoId` int NOT NULL,
  `WatchedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `WatchDuration` int NOT NULL DEFAULT '0',
  `CompletionPercent` decimal(5,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`Id`),
  KEY `FK_WatchHistory_User` (`UserId`),
  KEY `FK_WatchHistory_Video` (`VideoId`),
  CONSTRAINT `FK_WatchHistory_User` FOREIGN KEY (`UserId`) REFERENCES `user` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `FK_WatchHistory_Video` FOREIGN KEY (`VideoId`) REFERENCES `video` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `CHK_WatchHistory_Completion` CHECK ((`CompletionPercent` between 0 and 100)),
  CONSTRAINT `CHK_WatchHistory_Duration` CHECK ((`WatchDuration` >= 0))
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `watchhistory`
--

LOCK TABLES `watchhistory` WRITE;
/*!40000 ALTER TABLE `watchhistory` DISABLE KEYS */;
INSERT INTO `watchhistory` VALUES (1,107,34,'2026-05-18 16:27:18',0,0.00),(2,107,21,'2026-05-18 16:38:46',0,0.00),(3,107,69,'2026-05-22 05:00:57',0,0.00),(4,107,69,'2026-05-22 05:01:26',0,0.00),(5,107,69,'2026-05-22 05:02:08',0,0.00),(6,107,69,'2026-05-22 05:02:11',0,0.00),(7,107,53,'2026-05-22 05:02:28',0,0.00),(8,107,53,'2026-05-22 05:02:31',0,0.00),(9,107,49,'2026-05-22 05:02:54',0,0.00),(10,107,49,'2026-05-22 05:02:57',0,0.00),(11,107,69,'2026-05-22 06:39:33',0,0.00),(12,107,69,'2026-05-22 07:24:06',0,0.00),(13,107,69,'2026-05-22 07:24:50',0,0.00),(14,107,46,'2026-05-22 07:27:45',0,0.00),(15,107,69,'2026-05-22 07:42:35',0,0.00),(16,107,69,'2026-05-22 07:42:40',0,0.00),(17,107,69,'2026-05-22 07:42:43',0,0.00),(18,107,36,'2026-05-22 07:43:28',0,0.00),(19,107,49,'2026-05-22 13:39:24',0,0.00),(20,107,42,'2026-05-22 13:39:28',0,0.00),(21,107,69,'2026-05-22 13:39:36',0,0.00),(22,107,53,'2026-05-22 13:39:41',0,0.00),(23,107,69,'2026-05-22 13:39:49',0,0.00),(24,108,71,'2026-05-22 14:13:59',0,0.00),(25,107,71,'2026-05-22 16:03:47',0,0.00),(26,107,71,'2026-05-22 16:05:44',0,0.00),(27,107,21,'2026-05-22 20:15:14',0,0.00),(28,107,71,'2026-05-22 20:24:28',0,0.00);
/*!40000 ALTER TABLE `watchhistory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'bingedb'
--

--
-- Dumping routines for database 'bingedb'
--
/*!50003 DROP PROCEDURE IF EXISTS `sp_GetCreatorStats` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_GetCreatorStats`(IN p_CreatorId INT)
BEGIN
    SELECT
        COUNT(DISTINCT v.Id)                                     AS TotalVideos,
        COALESCE(SUM(v.Views), 0)                                AS TotalViews,
        COUNT(DISTINCT l.Id)                                     AS TotalLikes,
        SUM(CASE WHEN v.Status = 'Published' THEN 1 ELSE 0 END)  AS PublishedVideos,
        c.TotalSubscribers                                       AS Subscribers,
        COALESCE(SUM(rl.EstimatedRevenue), 0)                    AS TotalRevenue
    FROM creator c
    LEFT JOIN video v       ON v.CreatorId  = c.Id
    LEFT JOIN likes l       ON l.VideoId    = v.Id
    LEFT JOIN revenuelog rl ON rl.CreatorId = c.Id
    WHERE c.Id = p_CreatorId
    GROUP BY c.Id, c.TotalSubscribers;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_ToggleSubscription` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_ToggleSubscription`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_UploadVideo` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_UploadVideo`(
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
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `vw_creatordashboard`
--

/*!50001 DROP VIEW IF EXISTS `vw_creatordashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_creatordashboard` AS select `c`.`Id` AS `CreatorId`,`c`.`ChannelName` AS `ChannelName`,`c`.`TotalSubscribers` AS `TotalSubscribers`,`c`.`TotalViews` AS `TotalViews`,count(distinct `v`.`Id`) AS `TotalVideos`,count(distinct `l`.`Id`) AS `TotalLikes`,count(distinct `cm`.`Id`) AS `TotalComments` from (((`creator` `c` left join `video` `v` on((`v`.`CreatorId` = `c`.`Id`))) left join `likes` `l` on((`l`.`VideoId` = `v`.`Id`))) left join `comment` `cm` on((`cm`.`VideoId` = `v`.`Id`))) group by `c`.`Id`,`c`.`ChannelName`,`c`.`TotalSubscribers`,`c`.`TotalViews` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_creatorstats`
--

/*!50001 DROP VIEW IF EXISTS `vw_creatorstats`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_creatorstats` AS select `c`.`Id` AS `Id`,`c`.`ChannelName` AS `ChannelName`,`c`.`TotalSubscribers` AS `TotalSubscribers`,`c`.`TotalViews` AS `TotalViews`,`u`.`Email` AS `Email`,`u`.`Country` AS `Country`,`u`.`Status` AS `UserStatus`,count(distinct `v`.`Id`) AS `PublishedVideos`,count(distinct `s`.`Id`) AS `ActiveSubscribers`,coalesce(sum(`v`.`Views`),0) AS `RealTotalViews`,coalesce(sum(`rl`.`EstimatedRevenue`),0) AS `TotalRevenue` from ((((`creator` `c` join `user` `u` on((`c`.`UserId` = `u`.`Id`))) left join `video` `v` on(((`v`.`CreatorId` = `c`.`Id`) and (`v`.`Status` = 'Published')))) left join `subscription` `s` on((`s`.`CreatorId` = `c`.`Id`))) left join `revenuelog` `rl` on((`rl`.`CreatorId` = `c`.`Id`))) group by `c`.`Id`,`c`.`ChannelName`,`c`.`TotalSubscribers`,`c`.`TotalViews`,`u`.`Email`,`u`.`Country`,`u`.`Status` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_monthlywatchsummary`
--

/*!50001 DROP VIEW IF EXISTS `vw_monthlywatchsummary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_monthlywatchsummary` AS select month(`watchhistory`.`WatchedAt`) AS `Month`,year(`watchhistory`.`WatchedAt`) AS `Year`,count(0) AS `TotalWatches`,count(distinct `watchhistory`.`UserId`) AS `UniqueViewers`,count(distinct `watchhistory`.`VideoId`) AS `UniqueVideos`,round(avg(`watchhistory`.`CompletionPercent`),2) AS `AvgCompletion` from `watchhistory` group by year(`watchhistory`.`WatchedAt`),month(`watchhistory`.`WatchedAt`) order by `Year` desc,`Month` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_topcategories`
--

/*!50001 DROP VIEW IF EXISTS `vw_topcategories`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_topcategories` AS select `cat`.`Name` AS `Name`,count(distinct `v`.`Id`) AS `TotalVideos`,coalesce(sum(`v`.`Views`),0) AS `TotalViews`,count(distinct `l`.`Id`) AS `TotalLikes` from ((`category` `cat` left join `video` `v` on((`v`.`CategoryId` = `cat`.`Id`))) left join `likes` `l` on((`l`.`VideoId` = `v`.`Id`))) group by `cat`.`Id`,`cat`.`Name` order by `TotalViews` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_trendingvideos`
--

/*!50001 DROP VIEW IF EXISTS `vw_trendingvideos`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_trendingvideos` AS select `v`.`Id` AS `Id`,`v`.`Title` AS `Title`,`v`.`Views` AS `Views`,`v`.`UploadDate` AS `UploadDate`,`c`.`ChannelName` AS `ChannelName`,`cat`.`Name` AS `Category`,count(distinct `l`.`Id`) AS `TotalLikes`,count(distinct `cm`.`Id`) AS `TotalComments` from ((((`video` `v` join `creator` `c` on((`v`.`CreatorId` = `c`.`Id`))) join `category` `cat` on((`v`.`CategoryId` = `cat`.`Id`))) left join `likes` `l` on((`l`.`VideoId` = `v`.`Id`))) left join `comment` `cm` on((`cm`.`VideoId` = `v`.`Id`))) where (`v`.`Status` = 'Published') group by `v`.`Id`,`v`.`Title`,`v`.`Views`,`v`.`UploadDate`,`c`.`ChannelName`,`cat`.`Name` order by `v`.`Views` desc */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_useractivity`
--

/*!50001 DROP VIEW IF EXISTS `vw_useractivity`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_useractivity` AS select `u`.`Id` AS `Id`,`u`.`FirstName` AS `FirstName`,`u`.`LastName` AS `LastName`,`u`.`Email` AS `Email`,`u`.`Country` AS `Country`,`u`.`Status` AS `Status`,`u`.`JoinDate` AS `JoinDate`,count(distinct `wh`.`Id`) AS `VideosWatched`,count(distinct `cm`.`Id`) AS `CommentsMade`,count(distinct `l`.`Id`) AS `LikesGiven`,count(distinct `s`.`Id`) AS `Subscriptions`,max(`wh`.`WatchedAt`) AS `LastActive` from ((((`user` `u` left join `watchhistory` `wh` on((`wh`.`UserId` = `u`.`Id`))) left join `comment` `cm` on((`cm`.`UserId` = `u`.`Id`))) left join `likes` `l` on((`l`.`UserId` = `u`.`Id`))) left join `subscription` `s` on((`s`.`ViewerId` = `u`.`Id`))) group by `u`.`Id`,`u`.`FirstName`,`u`.`LastName`,`u`.`Email`,`u`.`Country`,`u`.`Status`,`u`.`JoinDate` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_videoengagement`
--

/*!50001 DROP VIEW IF EXISTS `vw_videoengagement`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_videoengagement` AS select `v`.`Id` AS `Id`,`v`.`Title` AS `Title`,`c`.`ChannelName` AS `ChannelName`,`v`.`Views` AS `Views`,count(distinct `l`.`Id`) AS `Likes`,count(distinct `cm`.`Id`) AS `Comments`,round(coalesce(avg(`wh`.`CompletionPercent`),0),2) AS `AvgCompletion`,round((((`v`.`Views` * 0.5) + (count(distinct `l`.`Id`) * 2)) + (count(distinct `cm`.`Id`) * 3)),2) AS `EngagementScore` from ((((`video` `v` join `creator` `c` on((`v`.`CreatorId` = `c`.`Id`))) left join `likes` `l` on((`l`.`VideoId` = `v`.`Id`))) left join `comment` `cm` on((`cm`.`VideoId` = `v`.`Id`))) left join `watchhistory` `wh` on((`wh`.`VideoId` = `v`.`Id`))) group by `v`.`Id`,`v`.`Title`,`c`.`ChannelName`,`v`.`Views` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-23  7:13:17
