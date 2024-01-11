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

create table tableCurrencies(
  currencyID serial primary key,
  quotepairID integer references tablePairs(pairID),
  basepairID integer references tablePairs(pairID)
);

create table tableAccount(
  accountID serial primary key,
  accountName char(15),
  userID integer references tableUsers(userID)
);

/*deposits*/
create table tableTransactions(
  transactionID serial primary key,
  transactionChoice text,
  transactionAmount numeric(7,3)
);

create table tableTrades(
  tradesID serial primary key,
  accountID integer references tableAccount(accountID),
  currencyID integer references tableCurrencies(currencyID),
  userID integer references tableUsers(userID),
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3),
  winLoss text
);

INSERT INTO tableUsers (username, passwd) VALUES ('MS', 'Admin123');