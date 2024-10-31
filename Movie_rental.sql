-- SQL queries for Database sprint 1
-- By: Brian Jackman
-- 2024/10/30


-- Create Tables 

CREATE TABLE movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    year INT NOT NULL,
    genre VARCHAR(100) NOT NULL,
    director VARCHAR(255) NOT NULL
);

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL
);

CREATE TABLE rentals (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    movie_id INT REFERENCES movies(id),
    rental_date DATE NOT NULL,
    return_date DATE
);


-- Insert Movies
INSERT INTO movies (title, year, genre, director) VALUES
('Inception', 2010, 'Sci-Fi', 'Christopher Nolan'),
('The Matrix', 1999, 'Sci-Fi', 'Lana Wachowski'),
('The Godfather', 1972, 'Crime', 'Francis Ford Coppola'),
('Pulp Fiction', 1994, 'Crime', 'Quentin Tarantino'),
('The Dark Knight', 2008, 'Action', 'Christopher Nolan');

-- Insert Customers
INSERT INTO customers (first_name, last_name, email, phone) VALUES
('John', 'Doe', 'john.doe@example.com', '1234567890'),
('Jane', 'Smith', 'jane.smith@example.com', '0987654321'),
('Alice', 'Johnson', 'alice.johnson@example.com', '5551234567'),
('Bob', 'Brown', 'bob.brown@example.com', '5559876543'),
('Charlie', 'Davis', 'charlie.davis@example.com', '5556781234');

-- Insert Rentals
INSERT INTO rentals (customer_id, movie_id, rental_date, return_date) VALUES
(1, 1, '2023-01-01', '2023-01-10'),
(2, 2, '2023-01-02', '2023-01-12'),
(3, 3, '2023-01-03', '2023-01-13'),
(4, 4, '2023-01-04', '2023-01-14'),
(5, 5, '2023-01-05', '2023-01-15'),
(1, 2, '2023-01-06', '2023-01-16'),
(2, 3, '2023-01-07', '2023-01-17'),
(3, 4, '2023-01-08', '2023-01-18'),
(4, 5, '2023-01-09', '2023-01-19'),
(5, 1, '2023-01-10', '2023-01-20');

-- Find all movies rented by a specific customer, given their email.
SELECT m.title
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN movies m ON r.movie_id = m.id
WHERE c.email = 'john.doe@example.com';

-- Given a movie title, list all customers who have rented the movie.
SELECT c.first_name, c.last_name
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN movies m ON r.movie_id = m.id
WHERE m.title = 'Inception';

-- Get the rental history for a specific movie title.
SELECT c.first_name, c.last_name, r.rental_date, r.return_date
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN movies m ON r.movie_id = m.id
WHERE m.title = 'Inception';

-- For a specific movie director:
-- Find the name of the customer, the date of the rental and title of the movie, each time a movie by that director was rented.
SELECT c.first_name, c.last_name, r.rental_date, m.title
FROM rentals r
JOIN customers c ON r.customer_id = c.id
JOIN movies m ON r.movie_id = m.id
WHERE m.director = 'Christopher Nolan';

-- List all currently rented out movies (movies whose return dates haven't been met).
SELECT m.title
FROM rentals r
JOIN movies m ON r.movie_id = m.id
WHERE r.return_date > CURRENT_DATE OR r.return_date IS NULL;