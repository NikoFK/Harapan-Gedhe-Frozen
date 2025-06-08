-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 08, 2025 at 12:45 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_harapan_gedhe_frozen`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `is_checked_out` tinyint(1) NOT NULL DEFAULT 0,
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`) VALUES
(1, 'Makanan', 'kategori makanan'),
(2, 'Barang', 'Nugget'),
(5, 'Bumu', 'Bumbu');

-- --------------------------------------------------------

--
-- Table structure for table `guestbook`
--

CREATE TABLE `guestbook` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guestbook`
--

INSERT INTO `guestbook` (`id`, `name`, `message`, `created_at`) VALUES
(1, 'demeks', 'terimakasih.. websitenya keren', '2025-05-03 03:26:26'),
(2, 'yuka', 'bagusss', '2025-05-03 06:24:55'),
(3, 'faiq', 'coba website ini', '2025-05-04 16:36:03');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('packaging','shipped','cancelled','completed') DEFAULT 'packaging',
  `payment_method` enum('debit','credit','cod') DEFAULT 'debit',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `description`, `image_url`, `category_id`, `stock`, `created_at`) VALUES
(1, 'Bebek', 20000.00, 'Bebek ukep frozen', 'bebek.jpg', 1, 3, '2025-04-29 08:21:14'),
(2, 'Ayam', 15000.00, 'Ayam ukep frozen', 'ayam.jpg', 1, 21, '2025-04-29 12:15:18'),
(3, 'Daun Salam', 7000.00, 'daun salam', 'daunsalam.jpg', 5, 5, '2025-04-29 12:15:56'),
(16, 'sticker', 500.00, 'stciker product', 'sticker.jpg', 2, 17, '2025-06-02 07:23:10');

-- --------------------------------------------------------

--
-- Table structure for table `resupply_orders`
--

CREATE TABLE `resupply_orders` (
  `resupply_order_id` int(11) NOT NULL,
  `requested_by_user_id` int(11) DEFAULT NULL COMMENT 'ID user admin yang membuat permintaan',
  `order_date` timestamp NULL DEFAULT current_timestamp() COMMENT 'Tanggal permintaan dibuat',
  `status` enum('pending_approval','approved','ordered_to_supplier','partially_shipped_by_supplier','fully_shipped_by_supplier','partially_received','fully_received','cancelled') NOT NULL DEFAULT 'pending_approval',
  `total_estimated_cost` decimal(15,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL COMMENT 'Catatan umum untuk pesanan resupply',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resupply_orders`
--

INSERT INTO `resupply_orders` (`resupply_order_id`, `requested_by_user_id`, `order_date`, `status`, `total_estimated_cost`, `notes`, `created_at`, `updated_at`) VALUES
(4, 1, '2025-06-04 07:57:12', 'cancelled', 45000.00, NULL, '2025-06-04 07:57:12', '2025-06-05 14:25:02'),
(5, 1, '2025-06-05 14:26:52', 'fully_received', 1200.00, NULL, '2025-06-05 14:26:52', '2025-06-05 15:59:38');

-- --------------------------------------------------------

--
-- Table structure for table `resupply_order_items`
--

CREATE TABLE `resupply_order_items` (
  `resupply_order_item_id` int(11) NOT NULL,
  `resupply_order_id` int(11) NOT NULL,
  `supplier_product_id` int(11) NOT NULL COMMENT 'Merujuk ke produk spesifik di tabel supplier_products',
  `supplier_id` int(11) NOT NULL COMMENT 'Merujuk ke supplier dari produk ini',
  `product_name_at_order` varchar(255) NOT NULL COMMENT 'Nama produk saat pemesanan (snapshot)',
  `quantity_ordered` int(11) NOT NULL,
  `price_at_order` decimal(12,2) NOT NULL COMMENT 'Harga satuan produk dari supplier saat pemesanan (snapshot)',
  `quantity_received` int(11) NOT NULL DEFAULT 0 COMMENT 'Jumlah yang sudah diterima',
  `item_status` enum('pending','partially_received','fully_received') NOT NULL DEFAULT 'pending',
  `last_received_date` date DEFAULT NULL COMMENT 'Tanggal terakhir penerimaan untuk item ini',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `resupply_order_items`
--

INSERT INTO `resupply_order_items` (`resupply_order_item_id`, `resupply_order_id`, `supplier_product_id`, `supplier_id`, `product_name_at_order`, `quantity_ordered`, `price_at_order`, `quantity_received`, `item_status`, `last_received_date`, `created_at`, `updated_at`) VALUES
(20, 4, 8, 3, 'Sosis Sapi Bratwurst Beku', 1, 45000.00, 1, 'fully_received', '2025-06-05', '2025-06-04 07:57:12', '2025-06-05 14:15:33'),
(21, 5, 3, 1, 'Standing Pouch Aluminium Foil 250g', 1, 1200.00, 1, 'fully_received', '2025-06-05', '2025-06-05 14:26:52', '2025-06-05 15:59:38');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `supplier_id` int(11) NOT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `contact_person` varchar(100) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `suppliers`
--

INSERT INTO `suppliers` (`supplier_id`, `supplier_name`, `contact_person`, `phone_number`, `email`, `address`, `created_at`, `updated_at`) VALUES
(1, 'PT Kemas Indah Plastik', 'Bapak Rudi Hartono', '081234567890', 'rudi.h@kemasindah.com', 'Jl. Industri Raya No. 12, Kawasan Industri Cikarang', '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(2, 'CV Stiker Jaya Abadi', 'Ibu Liana Dewi', '087788990011', 'liana.dewi@stikerjaya.co.id', 'Ruko Sentra Niaga Blok C/5, Surabaya', '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(3, 'Supplier Frozen Food Logistik', 'Mas Anto', '085611223344', 'anto.logistik@frozenlog.com', 'Jl. Pergudangan Makmur No. 8, Sidoarjo', '2025-06-03 13:15:47', '2025-06-03 13:15:47');

-- --------------------------------------------------------

--
-- Table structure for table `supplier_products`
--

CREATE TABLE `supplier_products` (
  `supplier_product_id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL COMMENT 'Nama produk spesifik dari supplier',
  `product_description` text DEFAULT NULL,
  `supplier_stock` int(11) NOT NULL DEFAULT 0 COMMENT 'Stok produk di tangan supplier',
  `unit_price_from_supplier` decimal(12,2) DEFAULT NULL COMMENT 'Harga satuan dari supplier',
  `availability_status` enum('ready','pre_order','out_of_stock') NOT NULL DEFAULT 'ready',
  `estimated_ready_date` date DEFAULT NULL COMMENT 'Perkiraan tanggal siap jika pre_order',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `supplier_products`
--

INSERT INTO `supplier_products` (`supplier_product_id`, `supplier_id`, `product_name`, `product_description`, `supplier_stock`, `unit_price_from_supplier`, `availability_status`, `estimated_ready_date`, `notes`, `created_at`, `updated_at`) VALUES
(1, 1, 'Plastik Vakum Nylon PE 15x20cm', 'Plastik kemasan vakum food grade, tebal 80 micron, cocok untuk frozen food.', 5000, 350.00, 'ready', NULL, 'Minimal order 1000 pcs', '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(2, 1, 'Plastik Vakum Nylon PE 20x30cm', 'Plastik kemasan vakum food grade, tebal 80 micron, ukuran lebih besar.', 2500, 550.00, 'ready', NULL, 'Minimal order 500 pcs', '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(3, 1, 'Standing Pouch Aluminium Foil 250g', 'Kemasan standing pouch dengan lapisan aluminium, zipper, untuk produk premium.', 1500, 1200.00, 'pre_order', NULL, 'Estimasi ready 2 minggu lagi', '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(4, 2, 'Stiker Vinyl Anti Air - Logo Bebek (5cm)', 'Stiker bahan vinyl tahan air dan minyak, cutting bulat diameter 5cm.', 10000, 150.00, 'ready', NULL, NULL, '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(5, 2, 'Stiker Vinyl Anti Air - Logo Ayam (5cm)', 'Stiker bahan vinyl tahan air dan minyak, cutting bulat diameter 5cm.', 8500, 150.00, 'ready', NULL, NULL, '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(6, 2, 'Label Stiker Komposisi Produk (Chrom_o)', 'Stiker bahan chromo untuk label informasi produk, ukuran 7x3cm.', 3000, 90.00, 'out_of_stock', NULL, NULL, '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(7, 3, 'Kentang Goreng Beku Premium Cut', 'Kentang beku siap goreng, potongan premium.', 200, 25000.00, 'ready', NULL, NULL, '2025-06-03 13:15:47', '2025-06-03 13:15:47'),
(8, 3, 'Sosis Sapi Bratwurst Beku', 'Sosis sapi bratwurst kualitas impor, isi 5 per packkkk', 150, 45000.00, 'ready', NULL, NULL, '2025-06-03 13:15:47', '2025-06-03 15:51:26'),
(9, 3, 'Unta', 'unta daging hidup', 12, 30000.00, 'ready', NULL, 'ini redi selalu ya ', '2025-06-03 15:52:12', '2025-06-03 15:52:12');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Laki-laki','Perempuan') DEFAULT NULL,
  `address` text DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `contact_no` varchar(20) DEFAULT NULL,
  `role` enum('customer','admin','supplier') DEFAULT 'customer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `date_of_birth`, `gender`, `address`, `city`, `contact_no`, `role`, `created_at`) VALUES
(1, 'admin', 'admin@gmail.com', 'admin', '2004-08-12', 'Laki-laki', 'Petemon Kuburan 88a', 'surabaya', '085174316699', 'admin', '2025-04-30 11:59:29'),
(2, 'demeks', 'demek@gmail.com', '1212', '2000-03-23', 'Perempuan', 'Sidoarjo, Kahuripan Nirwarna', 'Sidoarjo', '083663661636', 'customer', '2025-05-02 08:17:10'),
(3, 'yuka', 'yuka@gmail.com', 'yuka', '2025-05-02', 'Perempuan', 'wonrejo', 'surabaya', '0816271271', 'customer', '2025-05-03 03:06:25'),
(4, 'rizal', 'rizal@gmail.com', 'rizal', '2004-12-08', 'Laki-laki', 'perum pondok jati', 'Sidoarjo', '0877366251312', 'admin', '2025-05-04 16:33:38'),
(5, 'faiq', 'faiq@gmail.com', 'faiq', '2012-12-12', 'Laki-laki', 'puncak bromo', 'Pasuruan', '083766471313', 'customer', '2025-05-04 16:34:59'),
(6, 'supplier', 'supplier@gmail.com', 'supplier', '2007-07-09', 'Perempuan', 'Sidoarjo, Kahuripan Nirwarna', 'Sidoarjo', '01213131313', 'supplier', '2025-06-03 07:58:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `guestbook`
--
ALTER TABLE `guestbook`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `resupply_orders`
--
ALTER TABLE `resupply_orders`
  ADD PRIMARY KEY (`resupply_order_id`),
  ADD KEY `requested_by_user_id` (`requested_by_user_id`);

--
-- Indexes for table `resupply_order_items`
--
ALTER TABLE `resupply_order_items`
  ADD PRIMARY KEY (`resupply_order_item_id`),
  ADD KEY `resupply_order_id` (`resupply_order_id`),
  ADD KEY `supplier_product_id` (`supplier_product_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`supplier_id`);

--
-- Indexes for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD PRIMARY KEY (`supplier_product_id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `guestbook`
--
ALTER TABLE `guestbook`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `resupply_orders`
--
ALTER TABLE `resupply_orders`
  MODIFY `resupply_order_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `resupply_order_items`
--
ALTER TABLE `resupply_order_items`
  MODIFY `resupply_order_item_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `supplier_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `supplier_products`
--
ALTER TABLE `supplier_products`
  MODIFY `supplier_product_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `resupply_orders`
--
ALTER TABLE `resupply_orders`
  ADD CONSTRAINT `resupply_orders_ibfk_1` FOREIGN KEY (`requested_by_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `resupply_order_items`
--
ALTER TABLE `resupply_order_items`
  ADD CONSTRAINT `resupply_order_items_ibfk_1` FOREIGN KEY (`resupply_order_id`) REFERENCES `resupply_orders` (`resupply_order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `resupply_order_items_ibfk_2` FOREIGN KEY (`supplier_product_id`) REFERENCES `supplier_products` (`supplier_product_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `resupply_order_items_ibfk_3` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON UPDATE CASCADE;

--
-- Constraints for table `supplier_products`
--
ALTER TABLE `supplier_products`
  ADD CONSTRAINT `supplier_products_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`supplier_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
