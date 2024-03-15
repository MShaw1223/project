/*
    copy me over to neon : - )
*/
create table tableUsers (
  userID serial primary key,
  username varchar(15),
  passwd varchar(60),
  authKey varchar(16)
);

create table tablePairs(
  pairID serial primary key,
  pairAbbr varchar(4),
  userID integer references tableUsers(userID)
);

create table tableAccounts(
  accountID serial primary key,
  accountName varchar(15),
  userID integer references tableUsers(userID)
);

create table tableTrades(
  tradesID serial primary key,
  accountID integer references tableAccounts(accountID),
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3),
  winLoss text,
  currencyPair text
);

DELETE tableUsers, tableAccounts, tablePairs 
FROM tableUsers 
JOIN tableAccounts, tablePairs
ON tableUsers.userID = tableAccounts.userID, tableUsers.userID = tablePairs.userID
WHERE userID = ?;
[userID]