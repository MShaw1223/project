import sqlstring from "sqlstring";

const find_accounts = sqlstring.format(
  `
      select * from tableAccount
      `
);
export default find_accounts;
