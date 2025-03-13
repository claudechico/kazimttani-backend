-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 07, 2025 at 07:01 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kazimtaani`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `status` text DEFAULT 'pending',
  `reason` text NOT NULL,
  `description` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_id`, `customer_id`, `service_id`, `booking_date`, `booking_time`, `status`, `reason`, `description`, `created_at`, `updated_at`) VALUES
(28, 50, 12, '2025-02-20', '10:00:00', 'accepted', '', '', '2025-02-04 11:51:24', '2025-02-06 06:09:05'),
(29, 50, 11, '2025-02-19', '09:00:00', 'cancelled', 'Childcare Issue', '', '2025-02-06 05:18:03', '2025-02-06 06:05:28'),
(30, 50, 8, '2025-02-26', '10:00:00', 'cancelled', 'Childcare Issue', '', '2025-02-06 06:18:53', '2025-02-06 06:20:05'),
(31, 50, 7, '2025-02-27', '10:00:00', 'pending', '', '', '2025-02-06 09:24:43', '2025-02-06 09:24:43');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `name`, `description`, `created_at`) VALUES
(1, 'Plumbing', 'This category belongs to Plumbing', '2025-01-18 14:51:22'),
(2, 'Electrician', 'This category belongs to Electrician', '2025-01-18 14:51:48'),
(3, 'Cleaning', 'This category belongs to Cleaning', '2025-01-18 14:52:13'),
(4, 'Panting', 'This category belongs to Cleaning', '2025-01-18 14:52:30'),
(5, 'Laundry', 'This category belongs to Laundry', '2025-01-18 14:52:57'),
(6, 'Shifting', 'This category belongs to Shifting', '2025-01-18 14:53:16'),
(7, 'Appliance', 'This category belongs to Appliance', '2025-01-18 14:53:44'),
(8, 'Gardening', 'This category belongs to Gardening', '2025-01-18 14:54:13'),
(9, 'Phone Repair', 'This category belongs to Phone', '2025-01-18 14:54:48'),
(10, 'Computer Repair', 'This category belongs to Computer', '2025-01-18 14:55:14'),
(11, 'Carpenter', 'This category belongs to Carpenter', '2025-01-18 14:55:33'),
(12, 'Home maid', 'This category belongs to Home main', '2025-01-18 15:16:44');

-- --------------------------------------------------------

--
-- Table structure for table `chats`
--

CREATE TABLE `chats` (
  `chat_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `chats`
--

INSERT INTO `chats` (`chat_id`, `customer_id`, `provider_id`, `created_at`) VALUES
(4, 52, 52, '2025-01-28 16:59:26'),
(5, 50, 52, '2025-01-28 17:10:15'),
(6, 50, 53, '2025-02-04 09:45:07');

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favorite_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `chat_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message_text` text NOT NULL,
  `sent_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `chat_id`, `sender_id`, `receiver_id`, `message_text`, `sent_at`, `is_read`) VALUES
(31, 5, 50, 52, 'Habari yako', '2025-01-28 17:10:24', 0),
(32, 5, 52, 52, 'Salama', '2025-01-28 17:11:01', 0),
(33, 5, 52, 52, 'Nambie  mkuu', '2025-01-29 11:15:10', 0),
(34, 5, 50, 52, 'Kaka salama', '2025-01-31 07:37:49', 0),
(35, 5, 50, 52, 'Kakaka salama', '2025-01-31 07:37:55', 0),
(36, 5, 50, 52, 'Hello', '2025-01-31 07:51:54', 0),
(37, 5, 50, 52, 'Hello', '2025-01-31 08:23:37', 0),
(38, 6, 50, 53, 'mambo vip', '2025-02-04 09:45:14', 0),
(39, 6, 53, 53, 'Poaa', '2025-02-04 09:46:07', 0),
(40, 6, 50, 53, 'niajee', '2025-02-04 09:46:33', 0),
(41, 6, 53, 53, 'Fresh', '2025-02-04 09:47:03', 0),
(42, 6, 53, 53, 'Ok', '2025-02-04 09:47:34', 0),
(43, 6, 50, 53, 'Oi', '2025-02-06 17:56:20', 0);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `notification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(11) NOT NULL,
  `booking_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` enum('credit_card','paypal','cash') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `payment_date` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `review_id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `rating` int(11) DEFAULT NULL CHECK (`rating` between 1 and 5),
  `review_text` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`review_id`, `customer_id`, `service_id`, `rating`, `review_text`, `created_at`) VALUES
(8, 50, 8, 5, 'Good', '2025-01-29 11:17:34');

-- --------------------------------------------------------

--
-- Table structure for table `serviceimages`
--

CREATE TABLE `serviceimages` (
  `image_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `serviceimages`
--

INSERT INTO `serviceimages` (`image_id`, `service_id`, `image_url`, `created_at`) VALUES
(11, 7, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083271363_hhehhf?alt=media&token=b6f97bda-6d78-4e33-993e-7ff4b31df4e7', '2025-01-28 16:55:39'),
(12, 7, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083271367_a979qz?alt=media&token=95d57c03-b7d5-4e7f-8263-97de5d94d9b0', '2025-01-28 16:55:39'),
(13, 7, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083271367_k9uz1?alt=media&token=e6e25fb9-ff57-43af-bd37-5b0a8d495117', '2025-01-28 16:55:39'),
(14, 8, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083479739_j0qh4?alt=media&token=c74e24e2-96c4-489c-83ea-084211ed2892', '2025-01-28 16:58:48'),
(15, 8, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083479739_xus0b8?alt=media&token=482f9129-aac3-42bf-8237-a3de18a03f32', '2025-01-28 16:58:48'),
(16, 8, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083479740_ns0g1?alt=media&token=8d0c9313-e492-46b4-8473-dd97e0b3037c', '2025-01-28 16:58:48'),
(17, 8, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738083479740_q2lbx?alt=media&token=d682a1f1-41f6-4c15-9a79-79346d337e69', '2025-01-28 16:58:48'),
(18, 11, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738315986566_modu4c?alt=media&token=e4beaace-0cfb-486d-bd17-fba58f680ae8', '2025-01-31 09:33:51'),
(19, 11, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738315986569_ux99sk?alt=media&token=bf7193a4-bae0-4da3-b39e-e488f07e64af', '2025-01-31 09:33:51'),
(20, 11, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738315986569_a0tnbi?alt=media&token=29571ffa-f63d-4361-8ba8-88cb212a5ed5', '2025-01-31 09:33:51'),
(21, 12, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738318702391_g5zu5l?alt=media&token=cdb961a9-b2b2-4324-94c2-991137407419', '2025-01-31 10:18:51'),
(22, 12, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738318702393_ejyfv6?alt=media&token=ac3b015a-4153-491d-a4eb-7f592fbee9d3', '2025-01-31 10:18:51'),
(23, 12, 'https://firebasestorage.googleapis.com/v0/b/nitafutie-a9cd9.appspot.com/o/uploads%2F1738318702394_d094y8?alt=media&token=b705a85e-5422-4bb3-9276-12da4ba4b972', '2025-01-31 10:18:51');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `service_id` int(11) NOT NULL,
  `provider_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `category_id` int(100) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `images` text DEFAULT NULL,
  `availability` enum('available','unavailable') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `services`
--

INSERT INTO `services` (`service_id`, `provider_id`, `service_name`, `description`, `price`, `category_id`, `location`, `images`, `availability`, `created_at`, `updated_at`) VALUES
(7, 52, 'Tunafanya plumbing ', 'Tunafanya plumbing  sisi ni mafundi  wa  kiwango cha juu kabisa na huduma zetu ni Boraa', 300000.00, 1, 'Goba Njia nne', NULL, 'available', '2025-01-28 16:55:39', '2025-01-28 16:55:39'),
(8, 52, 'Mafundi umeme bingwa', 'Sisis ni mafundi  bingwa wa umeme  wa majumbani na viwandani\n', 400000.00, 2, 'Tabata segerea', NULL, 'available', '2025-01-28 16:58:48', '2025-01-28 16:58:48'),
(11, 53, 'Fundi computer ', 'Sisi ni mafundi  computer  tuliobobea  tunatengeneza  computer  kwa uweledi wa hali ya juuu', 30000.00, 10, 'Kisongo Arusha', NULL, 'available', '2025-01-31 09:33:51', '2025-01-31 09:33:51'),
(12, 53, 'Fundi Garden', 'Fundi mzuri wa Garden  tunapatikana dar es salaama Tanzania\n', 30000.00, 8, 'Tabata', NULL, 'available', '2025-01-31 10:18:51', '2025-01-31 10:18:51');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `experience` int(11) NOT NULL,
  `userType` text NOT NULL,
  `skills` text NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `profile_completed` tinyint(1) DEFAULT 0,
  `push_token` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `address`, `experience`, `userType`, `skills`, `profile_picture`, `created_at`, `updated_at`, `profile_completed`, `push_token`) VALUES
(50, 'Claude  Matemu ', 'claudematemu@gmail.com', '$2b$10$ZfqHlY/gVfRKds5bvoBGEu4ymgrqXtrswwIA4dHcbUTLAXGbLRymS', '0746815931', 'Segerea ', 0, 'Customer', 'Electrician', 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FProvidaPro-20082c82-5c4c-4da2-9478-4dc897ba3f88/ImagePicker/cafdc9bc-5ebc-41d7-a32c-8ad51545a6b3.jpeg', '2025-01-28 16:46:17', '2025-02-02 11:37:47', 0, NULL),
(52, 'Roman Matemu ', 'roman@gmail.com', '$2b$10$IYeGNk0r9Fl4I1JlHmszIutXkZTx1jWTNfA2i/IPUTqqDr/m2V2xa', '0746815931', 'Tabata ', 8, 'Provider', 'Plumber', 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FProvidaPro-20082c82-5c4c-4da2-9478-4dc897ba3f88/ImagePicker/1fcde6f1-e375-472c-b8c2-7e953c72a53b.jpeg', '2025-01-28 16:49:09', '2025-01-31 09:30:21', 0, NULL),
(53, 'Clarence Mrema', 'clarence@gmail.com', '$2b$10$3Ab9ERKPlBKK7csznureJOrpBC1KkWfcmLSbERAWJXG.bqY8wSAy6', '0625522843', 'Kimara ', 5, 'Provider', 'Electrician', 'file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540anonymous%252FProvidaPro-20082c82-5c4c-4da2-9478-4dc897ba3f88/ImagePicker/8466d102-8c8a-4f22-89ab-6c3b01ba4586.jpeg', '2025-01-30 18:30:29', '2025-02-04 08:41:21', 0, NULL),
(63, '', 'mteja@gmail.com', '$2b$10$SX/cyvKEDv3AFH.a6rfNuO3cw2g6pWawvWYBOjsGkzjIzNrJklYGG', NULL, NULL, 0, '', '', NULL, '2025-02-03 08:10:07', '2025-02-03 08:10:07', 0, NULL),
(64, '', 'lll@gmail.com', '$2b$10$5DtJY72INcCFQHvRftze..efL7K38AeRhkH/P3sK2wOffYOxf90gq', NULL, NULL, 0, '', '', NULL, '2025-02-03 08:16:45', '2025-02-03 08:16:45', 0, NULL),
(65, 'Claude ', 'Kaka@gmail.com', '$2b$10$GWr7PhnVMma6PSATaB8psex3LQFs5tgvWrTRHWEuymO7/cWEqg3O6', '0746815931', 'TabataT ', 8, 'Provider', 'Electrician', '', '2025-02-03 08:26:49', '2025-02-03 08:27:16', 0, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chat_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favorite_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `sender_id` (`sender_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `chat_id` (`chat_id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`review_id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `serviceimages`
--
ALTER TABLE `serviceimages`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `service_id` (`service_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`service_id`),
  ADD KEY `provider_id` (`provider_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `booking_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `chats`
--
ALTER TABLE `chats`
  MODIFY `chat_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favorite_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `review_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `serviceimages`
--
ALTER TABLE `serviceimages`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `service_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=66;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `chats`
--
ALTER TABLE `chats`
  ADD CONSTRAINT `chats_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `chats_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`provider_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`chat_id`) REFERENCES `chats` (`chat_id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `serviceimages`
--
ALTER TABLE `serviceimages`
  ADD CONSTRAINT `serviceimages_ibfk_1` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

--
-- Constraints for table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_ibfk_1` FOREIGN KEY (`provider_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
