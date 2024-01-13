/*
    copy me over to neon : - )
*/
create table tablePairs(
  pairID serial primary key,
  pairAbbr varchar(4)
);

create table tableUsers(
  userID serial primary key,
  username varchar(15),
  passwd varchar(20)
);

create table tableAccount(
  accountID serial primary key,
  accountName char(15),
  userID integer references tableUsers(userID)
);

create table tableTrades(
  tradesID serial primary key,
  accountID integer references tableAccount(accountID),
  userID integer references tableUsers(userID),
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3),
  winLoss text,
  currencyPair text
);
