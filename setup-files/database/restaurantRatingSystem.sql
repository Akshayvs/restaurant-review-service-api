CREATE DATABASE  IF NOT EXISTS `restaurant-rating-system` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `restaurant-rating-system`;
-- MySQL dump 10.13  Distrib 5.7.17, for macos10.12 (x86_64)
--
-- Host: localhost    Database: restaurant-rating-system
-- ------------------------------------------------------
-- Server version	5.7.20

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Addresses`
--

DROP TABLE IF EXISTS `Addresses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Addresses` (
  `address` varchar(45) NOT NULL,
  `state` varchar(15) NOT NULL,
  `city` varchar(15) NOT NULL,
  `zip` int(4) NOT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `address_UNIQUE` (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Addresses`
--

LOCK TABLES `Addresses` WRITE;
/*!40000 ALTER TABLE `Addresses` DISABLE KEYS */;
INSERT INTO `Addresses` VALUES ('1024, Ramona Drive','WashingtonDC','dc',22222),('1234, Grove Gate CT','Virginia','Richmond',21212),('3142, branch drive','Virginia','McLean',22040),('8221 Leesburg Pike','Virginia','Vienna',22112),('9335 Lee Highway','Virginia','fairfax',22031),('branch drive','WashingtonDC','dc',22222),('Justin Cafe Drive','WashingtonDC','dc',22222),('Justin Cafe Drive FOUR','WashingtonDC','dc',22222),('Justin Cafe Drive Three','WashingtonDC','dc',22222),('Justin Cafe Drive TWO','WashingtonDC','dc',22222),('Mclean branch drive ','Virginia','McLean',22222);
/*!40000 ALTER TABLE `Addresses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Rating`
--

DROP TABLE IF EXISTS `Rating`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Rating` (
  `cost` int(11) NOT NULL,
  `food` int(11) NOT NULL,
  `cleanliness` int(11) NOT NULL,
  `service` int(11) NOT NULL,
  `total_score` int(11) NOT NULL,
  `address` varchar(45) NOT NULL,
  `userphone` varchar(11) NOT NULL DEFAULT '',
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`address`,`userphone`),
  KEY `userPhone-to-Users_idx` (`userphone`),
  CONSTRAINT `addres-to-restaurants` FOREIGN KEY (`address`) REFERENCES `Restaurants` (`address`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `userPhone-to-Users` FOREIGN KEY (`userphone`) REFERENCES `Users` (`phone`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Rating`
--

LOCK TABLES `Rating` WRITE;
/*!40000 ALTER TABLE `Rating` DISABLE KEYS */;
INSERT INTO `Rating` VALUES (4,4,4,4,4,'1024, Ramona Drive','1112223333','2017-12-25 23:55:46'),(2,2,2,2,2,'1024, Ramona Drive','5714099543','2017-12-25 05:00:00'),(5,3,2,5,4,'1024, Ramona Drive','7773334444','2017-12-25 23:57:24'),(3,3,3,3,3,'3142, branch drive','5714099543','2017-12-25 05:00:00'),(5,5,5,5,5,'branch drive','5714099543','2017-10-25 04:00:00'),(2,2,2,2,2,'Justin Cafe Drive','1234554321','2017-10-25 04:00:00'),(4,4,4,4,4,'Justin Cafe Drive Three','1234554321','2017-06-25 04:00:00'),(1,2,3,4,3,'Justin Cafe Drive TWO','1234554321','2017-05-25 04:00:00');
/*!40000 ALTER TABLE `Rating` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Restaurants`
--

DROP TABLE IF EXISTS `Restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Restaurants` (
  `name` varchar(45) NOT NULL,
  `category` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  PRIMARY KEY (`address`),
  UNIQUE KEY `address_UNIQUE` (`address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Restaurants`
--

LOCK TABLES `Restaurants` WRITE;
/*!40000 ALTER TABLE `Restaurants` DISABLE KEYS */;
INSERT INTO `Restaurants` VALUES ('BombayCafe','Indian','1024, Ramona Drive'),('halalGuys','asias','1234, Grove Gate CT'),('SushiOn','Japanese','3142, branch drive'),('kizuna','japanese','8221 Leesburg Pike'),('subway','fastfood','9335 Lee Highway'),('SushiOn','japanese','branch drive'),('justinCafe','american','Justin Cafe Drive'),('justinCafe','american','Justin Cafe Drive FOUR'),('justinCafe','american','Justin Cafe Drive Three'),('justinCafe','american','Justin Cafe Drive TWO'),('Roti','mediterranean','Mclean branch drive ');
/*!40000 ALTER TABLE `Restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `phone` varchar(11) NOT NULL DEFAULT '',
  PRIMARY KEY (`phone`),
  UNIQUE KEY `phone_UNIQUE` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES ('john','doe','1112223333'),('Justin','Bieber','1234554321'),('akshay','sonawane','5714099543'),('John','Dietz','7773334444'),('jane','doe','9876543211'),('akshay','PizzaGuy','9998887777'),('adam','sandlers','9999999999');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-12-25 20:08:37
