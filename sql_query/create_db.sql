CREATE DATABASE IF NOT EXISTS pcb;

USE pcb;

-- Create the "products_numbers" table
CREATE TABLE IF NOT EXISTS products_numbers (
    refference_number VARCHAR(255) PRIMARY KEY,
    state VARCHAR(255) NOT NULL
);

-- Create the "users" table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    refference_number VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    FOREIGN KEY (refference_number) REFERENCES products_numbers(refference_number)
);

-- Create the "product_data" table
CREATE TABLE IF NOT EXISTS product_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    co FLOAT,
    co2 FLOAT,
    nox FLOAT,
    so2 FLOAT,
    pm1 FLOAT,
    pm2_5 FLOAT,
    pm10 FLOAT,
    refference_number VARCHAR(255) NOT NULL,
    FOREIGN KEY (refference_number) REFERENCES users(refference_number)
);

