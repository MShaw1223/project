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
  userID integer references tableUsers(userID) on delete cascade
);

create table tableAccounts(
  accountID serial primary key,
  accountName varchar(15),
  userID integer references tableUsers(userID) on delete cascade
);

create table tableTrades(
  tradesID serial primary key,
  accountID integer references tableAccounts(accountID) on delete cascade,
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3),
  winLoss text,
  currencyPair text
);
