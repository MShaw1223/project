import sqlstring from "sqlstring";
import { Pool } from "@neondatabase/serverless";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const queryAvailableAccs = sqlstring.format(
  `
    select * from tableAccount
  `
  /* where userID = ${loggedIn} */
);

const findAvailableAccs = async () => {
  try {
    const result = await pool.query(queryAvailableAccs);
    return result.rows.map((row) => ({
      ...row,
      currencyPair: row.currencyPair, // concatenated pair abbreviations
    }));
  } catch (error) {
    console.error("Error executing query:", queryAvailableAccs);
    console.error("Error details:", error);
    throw error;
  }
};

export default findAvailableAccs;

/*



const queryAvailableAccs = sqlstring.format(
  `
    SELECT
      tc.*,
      CONCAT(qp.pairAbbr, bp.pairAbbr) AS currencyPair
    FROM
      tableCurrencies tc
    JOIN
      tablePairs qp ON tc.quotepairID = qp.pairID
    JOIN
      tablePairs bp ON tc.basepairID = bp.pairID;
  `
);

const findAvailablePairs 

export default findAvailablePairs;
*/
