/* Drop existing tables (for idempotency) */
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS employees;

/* Users Table */
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    email VARCHAR(100) UNIQUE,
    registration_date DATE,
    last_login TIMESTAMP,
    is_active BOOLEAN,
    tier VARCHAR(20) CHECK (tier IN ('basic', 'premium', 'vip'))
);

/* Products Table */
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100),
    category VARCHAR(50),
    price DECIMAL(10,2),
    stock_quantity INT,
    release_date DATE,
    is_available BOOLEAN,
    specs JSONB
);

/* Orders Table */
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id),
    product_id INT REFERENCES products(product_id),
    quantity INT,
    order_date TIMESTAMP,
    delivery_date DATE,
    status VARCHAR(20) CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
    discount DECIMAL(5,2)
);

/* Reviews Table */
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    user_id INT REFERENCES users(user_id),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    is_verified BOOLEAN
);

/* Employees Table */
CREATE TABLE employees (
    employee_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    department VARCHAR(50),
    salary DECIMAL(10,2),
    hire_date DATE,
    is_full_time BOOLEAN
);

/*** Insert Test Data ***/

-- Users
INSERT INTO users (username, email, registration_date, last_login, is_active, tier) VALUES
('alice123', 'alice@example.com', '2023-01-15', '2023-11-25 09:34:21', true, 'premium'),
('bob_tech', 'bob@example.com', '2022-08-04', '2023-11-24 14:15:03', true, 'vip'),
('charlie_g', 'charlie@example.com', '2023-05-20', NULL, false, 'basic'),
('data_dave', 'dave@example.com', '2023-11-01', '2023-11-25 10:00:00', true, 'premium'),
('eve_admin', 'eve@example.com', '2021-12-10', '2023-11-20 12:00:00', true, 'vip'),
('frankie', 'frankie@example.com', '2023-06-15', NULL, false, 'basic');

-- Products
INSERT INTO products (product_name, category, price, stock_quantity, release_date, is_available, specs) VALUES
('UltraBook Pro', 'Electronics', 1299.99, 50, '2023-09-01', true, '{"color": "space gray", "storage": "1TB SSD", "warranty": "2 years"}'),
('Organic Coffee', 'Groceries', 12.50, 200, '2022-03-15', true, '{"origin": "Colombia", "weight": "500g"}'),
('Yoga Mat', 'Fitness', 29.95, 75, '2023-11-10', true, '{"material": "eco-friendly", "thickness": "6mm"}'),
('Smart Thermostat', 'Home Automation', 199.00, 0, '2023-10-05', false, '{"compatibility": ["iOS", "Android"], "wifi": true}'),
('Gaming Chair', 'Furniture', 299.99, 20, '2023-07-15', true, '{"color": "black", "adjustable": true, "warranty": "1 year"}'),
('Noise Cancelling Headphones', 'Electronics', 199.99, 100, '2023-05-01', true, '{"color": "white", "battery_life": "30 hours"}');

-- Orders
INSERT INTO orders (user_id, product_id, quantity, order_date, delivery_date, status, discount) VALUES
(1, 1, 1, '2023-11-15 14:30:00', '2023-11-18', 'delivered', 0.00),
(2, 3, 2, '2023-11-20 09:15:00', NULL, 'shipped', 10.00),
(1, 2, 5, '2023-11-24 18:45:00', NULL, 'pending', 5.50),
(4, 4, 1, '2023-11-25 08:00:00', NULL, 'cancelled', 0.00),
(5, 5, 1, '2023-11-10 10:00:00', '2023-11-12', 'delivered', 15.00),
(6, 6, 3, '2023-11-22 16:00:00', NULL, 'pending', 0.00);

-- Reviews
INSERT INTO reviews (product_id, user_id, rating, comment, is_verified) VALUES
(1, 1, 5, 'Best laptop ever!', true),
(3, 2, 4, 'Good mat but could be thicker', false),
(2, 3, 3, NULL, true), -- No comment
(4, 4, 1, 'Never received item', false),
(5, 5, 5, 'Super comfortable and great for gaming!', true),
(6, 6, 4, 'Amazing sound quality, but a bit pricey.', true);

-- Employees
INSERT INTO employees (first_name, last_name, department, salary, hire_date, is_full_time) VALUES
('Sarah', 'Lee', 'HR', 65000.00, '2020-06-01', true),
('Mike', 'Brown', 'Engineering', 95000.00, '2022-02-15', true),
('Emma', 'Wilson', 'Sales', 48000.00, '2023-09-10', false),
('John', 'Doe', 'Engineering', 105000.00, '2019-01-20', true),
('Anna', 'Smith', 'Marketing', 72000.00, '2021-03-15', true);
