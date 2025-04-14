-- create database nea_rewrite;

use nea_rewrite;

-- create table tableUsers (
   -- userID serial primary key,
    -- username varchar(15),
    -- passwd varchar(60),
	-- authKey varchar(16)
-- );

-- create table tablePairs(
  -- pairID serial primary key,
  -- pairAbbr varchar(4)
-- );

create table userpairs (
	userID serial primary key references tableUsers(userID) on delete cascade,
    pairID serial references tablePairs(pairID) on delete cascade
);
-- 20:25:10	create table userpairs (  userID integer references tableUsers(userID) on delete cascade,     
-- pairID integer references tablePairs(pairID) on delete cascade )	Error Code: 3780. Referencing column 'userID' and referenced column 'userID' in foreign key constraint 'userpairs_ibfk_1' are incompatible.	
-- 0.00085 sec

-- 20:31:09	create table userpairs (  userID serial references tableUsers(userID) on delete cascade,     
-- pairID serial references tablePairs(pairID) on delete cascade )	Error Code: 1075. Incorrect table definition; there can be only one auto column and it must be defined as a key	
-- 0.0011 sec

-- 20:33:11	create table userpairs (  userID serial primary key references tableUsers(userID) on delete cascade,     
-- pairID serial references tablePairs(pairID) on delete cascade )	Error Code: 1075. Incorrect table definition; there can be only one auto column and it must be defined as a key	
-- 0.00084 sec


create table tableAccounts(
  accountID serial primary key,
  accountName varchar(15)
);

create table useraccount(
	accountID serial references tableAccounts(userID) on delete cascade,
    userID serial references tableUser(userID) on delete cascade
);

create table tableTrades(
  tradesID serial primary key,
  entryPrice numeric(14,7),
  stopLoss numeric(14,7),
  takeProfit numeric(14,7),
  tradeNotes text,
  riskRatio numeric(7, 3),
  winLoss enum('w','l'),
  currencyPair text
);

create table accounttrades(
  tradesID serial references tabletrades(tradesID) on delete cascade,
  accountID serial references tableAccounts(accountID) on delete cascade
);
