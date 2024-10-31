const { Pool, Client } = require("pg");

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "Movie_Rental_DB",
  password: "MoviePass64",
  port: 5432,
});

/**
 * Creates the database if it does not exist.
 */
async function createDatabase() {
  const client = new Client({
    user: "postgres",
    host: "localhost",
    password: "MoviePass64",
    port: 5432,
  });

  try {
    await client.connect();
    await client.query(`CREATE DATABASE "Movie_Rental_DB"`);
    console.log('Database "Movie_Rental_DB" created successfully');
  } catch (err) {
    if (err.code === "42P04") {
      console.log('Database "Movie_Rental_DB" already exists');
    } else {
      console.error("Error creating database", err);
    }
  } finally {
    await client.end();
  }
}

/**
 * Creates the database tables, if they do not already exist.
 */
async function createTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS movies (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        year INT NOT NULL,
        genre VARCHAR(100) NOT NULL,
        director VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rentals (
        id SERIAL PRIMARY KEY,
        customer_id INT REFERENCES customers(id),
        movie_id INT REFERENCES movies(id),
        rental_date DATE NOT NULL,
        return_date DATE
      );
    `);

    console.log("Tables created successfully");
  } catch (err) {
    console.error("Error creating tables", err);
  } finally {
    client.release();
  }
}

/**
 * Inserts a new movie into the Movies table.
 *
 * @param {string} title Title of the movie
 * @param {number} year Year the movie was released
 * @param {string} genre Genre of the movie
 * @param {string} director Director of the movie
 */
async function insertMovie(title, year, genre, director) {
  const client = await pool.connect();
  try {
    const query = `
      INSERT INTO movies (title, year, genre, director)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [title, year, genre, director];
    const res = await client.query(query, values);
    console.log("Movie inserted successfully:", res.rows[0]);
  } catch (err) {
    console.error("Error inserting movie", err);
  } finally {
    client.release();
  }
}

/**
 * Prints all movies in the database to the console
 */
async function displayMovies() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT * FROM movies");
    console.log("Movies:");
    res.rows.forEach((movie) => {
      console.log(
        `ID: ${movie.id}, Title: ${movie.title}, Year: ${movie.year}, Genre: ${movie.genre}, Director: ${movie.director}`
      );
    });
  } catch (err) {
    console.error("Error retrieving movies", err);
  } finally {
    client.release();
  }
}

/**
 * Updates a customer's email address.
 *
 * @param {number} customerId ID of the customer
 * @param {string} newEmail New email address of the customer
 */
async function updateCustomerEmail(customerId, newEmail) {
  const client = await pool.connect();
  try {
    const query = `
      UPDATE customers
      SET email = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [newEmail, customerId];
    const res = await client.query(query, values);
    if (res.rowCount > 0) {
      console.log("Customer email updated successfully:", res.rows[0]);
    } else {
      console.log("Customer not found");
    }
  } catch (err) {
    console.error("Error updating customer email", err);
  } finally {
    client.release();
  }
}

/**
 * Removes a customer from the database along with their rental history.
 *
 * @param {number} customerId ID of the customer to remove
 */
async function removeCustomer(customerId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Delete rental history for the customer
    await client.query("DELETE FROM rentals WHERE customer_id = $1", [
      customerId,
    ]);

    // Delete the customer
    const res = await client.query(
      "DELETE FROM customers WHERE id = $1 RETURNING *",
      [customerId]
    );

    if (res.rowCount > 0) {
      console.log(
        "Customer and their rental history removed successfully:",
        res.rows[0]
      );
    } else {
      console.log("Customer not found");
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error removing customer and their rental history", err);
  } finally {
    client.release();
  }
}

/**
 * Prints a help message to the console
 */
function printHelp() {
  console.log("Usage:");
  console.log("  insert <title> <year> <genre> <director> - Insert a movie");
  console.log("  show - Show all movies");
  console.log("  update <customer_id> <new_email> - Update a customer's email");
  console.log("  remove <customer_id> - Remove a customer from the database");
}

/**
 * Runs our CLI app to manage the movie rentals database
 */
async function runCLI() {
  await createDatabase();
  await createTable();

  const args = process.argv.slice(2);
  switch (args[0]) {
    case "insert":
      if (args.length !== 5) {
        printHelp();
        return;
      }
      await insertMovie(args[1], parseInt(args[2]), args[3], args[4]);
      break;
    case "show":
      await displayMovies();
      break;
    case "update":
      if (args.length !== 3) {
        printHelp();
        return;
      }
      await updateCustomerEmail(parseInt(args[1]), args[2]);
      break;
    case "remove":
      if (args.length !== 2) {
        printHelp();
        return;
      }
      await removeCustomer(parseInt(args[1]));
      break;
    default:
      printHelp();
      break;
  }
}

runCLI().catch((err) => console.error("Error in runCLI:", err));
