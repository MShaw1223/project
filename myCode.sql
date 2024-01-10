/*
    copy me over to neon : - )
*/
create table tableTrades(
  tradesID serial primary key,
  accountID integer references tableAccount(accountID),
  currencyID integer references tableCurrencies(currencyID),
  userID integer references tableUsers(userID),
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3)
  winLoss char(5) /*can do like win/loss dropdown then win y/n */
);

create table tableAccount(
  accountID serial primary key,
  accountName char(15)
  userID integer references tableUsers(userID),
);

create table tableUsers(
  userID serial primary key,
  username varchar(15)
);

create table tableCurrencies(
  currencyID serial primary key,
  quotepairID integer references tablePairs(pairID),
  basepairID integer references tablePairs(pairID)
);

create table tablePairs(
  pairID serial primary key,
  pairName varchar(15),
  pairAbbr varchar(4)
);