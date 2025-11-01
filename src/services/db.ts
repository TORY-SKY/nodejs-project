import postgres from 'postgres';
import 'dotenv/config'; // Make sure environment variables are loaded

// 1. Get the connection string from the environment variables
const connectionString = process.env.DATABASE_URL;

// 2. Validate the connection string (essential for error prevention)
if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set or is empty.');
}

// 3. Initialize the postgres client
// The 'connectionString' variable is passed to the postgres function
const sql = postgres(connectionString);

// 4. Export the client for use in your controllers and services
export default sql;