-- ============================================================
-- AI-POWERED RETURNS INTELLIGENCE SYSTEM
-- Database Schema (schema.sql)
-- ============================================================
-- This file creates all the tables our system needs.
-- Run this file FIRST before seed.sql
-- 
-- HOW TO RUN: 
--   Open MySQL terminal and type: source C:/path/to/schema.sql
--   OR use MySQL Workbench → File → Open SQL Script → Run
-- ============================================================

-- Step 1: Create the database (IF NOT EXISTS means it won't error if already created)
CREATE DATABASE IF NOT EXISTS supply_chain;

-- Step 2: Tell MySQL to use this database for all following commands
USE supply_chain;

-- ============================================================
-- TABLE 1: USERS
-- Stores application login credentials and profile roles
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    login_id VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    role ENUM('business', 'customer') NOT NULL,
    password_hash CHAR(128) NOT NULL,
    password_salt VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLE 2: PRODUCTS
-- Stores information about each product in our catalog
-- Think of this like a product listing on Amazon/Flipkart
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,        -- Unique ID for each product (auto-generated)
    name VARCHAR(255) NOT NULL,                -- Product name (e.g., "Blue Cotton T-Shirt")
    category VARCHAR(100) NOT NULL,            -- Category (e.g., "Clothing", "Electronics")
    subcategory VARCHAR(100),                  -- Subcategory (e.g., "T-Shirts", "Smartphones")
    price DECIMAL(10, 2) NOT NULL,             -- Price in rupees (e.g., 999.00)
    brand VARCHAR(100),                        -- Brand name (e.g., "Nike", "Samsung")
    description TEXT,                          -- Full product description
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,     -- Average customer rating (0.00 to 5.00)
    total_reviews INT DEFAULT 0,               -- How many reviews this product has
    total_sold INT DEFAULT 0,                  -- Total units sold
    total_returned INT DEFAULT 0,              -- Total units returned
    return_rate DECIMAL(5, 2) DEFAULT 0.00,    -- Return percentage (returned/sold * 100)
    image_url VARCHAR(500),                    -- Product image URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- When this product was added
);

-- ============================================================
-- TABLE 3: REVIEWS
-- Stores customer reviews for products
-- This is the RAW TEXT data our AI will analyze
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique review ID
    product_id INT NOT NULL,                   -- Which product this review is for (links to products table)
    customer_name VARCHAR(100),                -- Name of the reviewer
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),  -- Star rating: 1 to 5
    review_text TEXT,                          -- The actual review text (this is what AI analyzes!)
    review_date DATE,                          -- When the review was posted
    verified_purchase BOOLEAN DEFAULT TRUE,    -- Was this a verified purchase?
    helpful_votes INT DEFAULT 0,              -- How many people found this helpful
    
    -- FLAGS our AI will set:
    is_suspicious BOOLEAN DEFAULT FALSE,       -- Did our fake-review detector flag this?
    suspicion_score DECIMAL(3, 2) DEFAULT 0.00, -- How suspicious (0.00 = genuine, 1.00 = definitely fake)
    suspicion_reasons TEXT,                    -- Why it was flagged (stored as JSON text)
    sentiment_score DECIMAL(3, 2) DEFAULT 0.00, -- Sentiment: -1.00 (very negative) to 1.00 (very positive)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- FOREIGN KEY: This links review → product. If a product is deleted, its reviews are also deleted.
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 4: RETURNS
-- Stores data about product returns
-- Each row = one customer returning one product
-- ============================================================
CREATE TABLE IF NOT EXISTS returns (
    id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique return ID
    product_id INT NOT NULL,                   -- Which product was returned
    customer_name VARCHAR(100),                -- Who returned it
    return_date DATE,                          -- When was it returned
    
    -- Return reason (these are the vague dropdown reasons customers select):
    return_reason VARCHAR(255),                -- e.g., "Not as expected", "Defective", "Wrong size"
    
    -- Detailed notes (this is the REAL gold — free text the customer writes):
    detailed_notes TEXT,                       -- e.g., "Color looked completely different from photos"
    
    -- Return metadata:
    refund_amount DECIMAL(10, 2),              -- How much was refunded
    return_status ENUM('pending', 'approved', 'rejected', 'completed') DEFAULT 'completed',
    
    -- AI-extracted fields (our system fills these):
    ai_extracted_issue VARCHAR(255),           -- AI's classification (e.g., "color_mismatch")
    ai_confidence DECIMAL(3, 2) DEFAULT 0.00, -- How confident AI is (0.00 to 1.00)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 5: CUSTOMER SUPPORT TICKETS
-- Stores customer complaints/queries from support channels
-- Another valuable data source for understanding WHY returns happen
-- ============================================================
CREATE TABLE IF NOT EXISTS customer_support_tickets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,                   -- Which product the complaint is about
    customer_name VARCHAR(100),
    issue_type VARCHAR(100),                   -- Category of issue (e.g., "Quality", "Shipping")
    message TEXT,                              -- The customer's actual complaint message
    resolution VARCHAR(255),                   -- How it was resolved
    ticket_date DATE,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'resolved',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- TABLE 6: AI INSIGHTS (Cache)
-- Stores the AI-generated insights for each product
-- This is pre-computed so the dashboard loads FAST
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_insights (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,                   -- Which product this insight is about
    insight_type VARCHAR(50),                  -- Type: 'root_cause', 'risk_score', 'recommendation', 'summary'
    insight_data JSON,                         -- The actual insight stored as JSON
    confidence DECIMAL(3, 2) DEFAULT 0.00,     -- How confident the AI is
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============================================================
-- INDEX CREATION
-- Indexes make database queries FASTER (like a book's index)
-- We create indexes on columns we'll search/filter by frequently
-- ============================================================
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_returns_product ON returns(product_id);
CREATE INDEX idx_support_product ON customer_support_tickets(product_id);
CREATE INDEX idx_insights_product ON ai_insights(product_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_returns_reason ON returns(return_reason);
CREATE INDEX idx_users_login_id ON users(login_id);
