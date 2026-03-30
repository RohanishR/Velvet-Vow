-- Database Initialization Script

CREATE DATABASE IF NOT EXISTS velvet_vow_db;
USE velvet_vow_db;

CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'vendor') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Events (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    members INT NOT NULL,
    event_date DATE NOT NULL,
    contact_number VARCHAR(15) NOT NULL,
    city VARCHAR(255) NOT NULL,
    catering_type VARCHAR(100) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Venues (
    venue_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL DEFAULT 'Chennai',
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    price VARCHAR(100) NOT NULL,
    image VARCHAR(255) DEFAULT '/assets/wedding.avif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    venue_id INT NOT NULL,
    event_date DATE NOT NULL,
    status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES Events(event_id) ON DELETE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES Venues(venue_id) ON DELETE CASCADE,
    UNIQUE KEY unique_booking (venue_id, event_date)
);

-- Dummy Venues Data logic template to test GPS:
-- NOTE: Please ensure the vendor_id '1' actually matches your registered Vendor account in the Users table!
-- INSERT INTO Venues (venue_id, vendor_id, city, name, location, latitude, longitude, price) VALUES 
-- (1, 1, 'Chennai', 'Leela Palace Banquet', 'Chennai', 13.0487, 80.2824, '300000'),
-- (2, 1, 'Chennai', 'ITC Grand Chola Hall', 'Chennai', 13.0100, 80.2200, '500000'),
-- (3, 1, 'Chennai', 'Green Meadows Resort', 'Chennai', 12.9500, 80.2500, '180000'),
-- (4, 1, 'Chennai', 'Sree Amruthaa Palace', 'Chennai', 13.0800, 80.2400, '120000'),
-- (5, 1, 'Chennai', 'Rajah Annamalai Hall', 'Chennai', 13.0900, 80.2700, '200000');
