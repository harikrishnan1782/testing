-- ============================================================
-- INVENTORY MANAGEMENT SYSTEM - DATABASE SCHEMA
-- ============================================================
-- This script creates all necessary tables for the inventory
-- management system with proper relationships and indexes.
-- ============================================================

-- Drop database if exists (WARNING: This will delete all data!)
-- Uncomment the next line only if you want to start fresh
-- DROP DATABASE IF EXISTS inventory_system;

-- Create the database
CREATE DATABASE IF NOT EXISTS inventory_system;
USE inventory_system;

-- ============================================================
-- TABLE 1: USERS
-- Stores admin and staff credentials with bcrypt hashed passwords
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') NOT NULL DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for faster queries
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 2: ITEMS
-- Stores inventory data and stock levels
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 5,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_sku (sku),
    INDEX idx_name (name),
    INDEX idx_quantity (quantity),
    INDEX idx_low_stock (quantity, min_stock_level)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 3: SALES
-- Stores the main sale/invoice details
-- ============================================================
CREATE TABLE IF NOT EXISTS sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    customer_name VARCHAR(100),
    customer_phone VARCHAR(15),
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    gst_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key to users table
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    -- Indexes for reporting
    INDEX idx_sale_date (sale_date),
    INDEX idx_user_id (user_id),
    INDEX idx_customer (customer_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 4: SALE_ITEMS
-- Stores individual line items for each sale
-- ============================================================
CREATE TABLE IF NOT EXISTS sale_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    item_id INT,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    
    -- Foreign keys
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE SET NULL,
    
    -- Indexes
    INDEX idx_sale_id (sale_id),
    INDEX idx_item_id (item_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE 5: SESSIONS (Optional - for express-mysql-session)
-- Only needed if you want to keep session functionality
-- You can skip this if using JWT tokens only
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data MEDIUMTEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INSERT SAMPLE DATA
-- ============================================================

-- Insert default admin user
-- Password: "admin" (plain text for initial setup - will be hashed by backend)
-- IMPORTANT: Change this password immediately after first login!
INSERT INTO users (username, email, password_hash, role) 
VALUES ('Admin', 'admin@ims.com', 'admin', 'admin')
ON DUPLICATE KEY UPDATE username = username;

-- Insert sample staff user
INSERT INTO users (username, email, password_hash, role) 
VALUES ('Staff User', 'staff@ims.com', 'staff123', 'staff')
ON DUPLICATE KEY UPDATE username = username;

-- Insert sample inventory items
INSERT INTO items (sku, name, description, price, quantity, min_stock_level) VALUES
('ELEC-001', 'Wireless Mouse', '2.4GHz Optical Mouse with USB Receiver', 450.00, 25, 5),
('ELEC-002', 'Mechanical Keyboard', 'RGB Backlit Gaming Keyboard', 1200.00, 15, 5),
('ELEC-003', 'USB-C Cable', '1m Fast Charging Cable', 150.00, 50, 10),
('ELEC-004', 'Laptop Stand', 'Aluminum Adjustable Stand', 850.00, 10, 3),
('ELEC-005', 'Webcam HD', '1080p USB Webcam with Microphone', 2500.00, 8, 3),
('OFF-101', 'Notebook A5', '100 pages ruled notebook', 80.00, 100, 20),
('OFF-102', 'Pen Set', 'Pack of 10 ballpoint pens', 120.00, 75, 15),
('OFF-103', 'Sticky Notes', 'Colorful sticky note pads', 95.00, 60, 10),
('OFF-104', 'Stapler', 'Metal heavy-duty stapler', 200.00, 30, 5),
('OFF-105', 'Paper Clips', 'Box of 100 clips', 40.00, 80, 15)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================================
-- USEFUL QUERIES FOR VERIFICATION
-- ============================================================

-- Check if tables were created
-- SHOW TABLES;

-- Verify users
-- SELECT * FROM users;

-- Verify items
-- SELECT * FROM items;

-- Check low stock items
-- SELECT name, sku, quantity, min_stock_level 
-- FROM items 
-- WHERE quantity <= min_stock_level;

-- ============================================================
-- MAINTENANCE QUERIES
-- ============================================================

-- Delete all sales data (keeping items and users)
-- DELETE FROM sale_items;
-- DELETE FROM sales;
-- ALTER TABLE sales AUTO_INCREMENT = 1;

-- Reset all item quantities to 0
-- UPDATE items SET quantity = 0;

-- Delete all items
-- DELETE FROM items;
-- ALTER TABLE items AUTO_INCREMENT = 1;

-- ============================================================
-- BACKUP REMINDER
-- ============================================================
-- To backup this database:
-- mysqldump -u root -p inventory_system > inventory_backup.sql
--
-- To restore from backup:
-- mysql -u root -p inventory_system < inventory_backup.sql
-- ============================================================

-- Display success message
SELECT 'Database setup completed successfully!' AS Status,
       (SELECT COUNT(*) FROM users) AS Total_Users,
       (SELECT COUNT(*) FROM items) AS Total_Items,
       (SELECT COUNT(*) FROM sales) AS Total_Sales;