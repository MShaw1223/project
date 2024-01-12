import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const queryAvailablePairs = sqlstring.format(
  `
    SELECT
      *
    FROM
      tablePairs
  `
);

const findAvailablePairs = async () => {
  try {
    const result = await pool.query(queryAvailablePairs);
    return { result }; // return the pairs
  } catch (error) {
    console.error("Error executing query:", queryAvailablePairs);
    console.error("Error details:", error);
    throw error;
  }
};

export default findAvailablePairs;
