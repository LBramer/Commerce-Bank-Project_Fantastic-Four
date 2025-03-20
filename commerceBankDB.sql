create database commerceBank;
use commerceBank;
select database();

CREATE TABLE User
(username VARCHAR(30),
password VARCHAR(30),
PRIMARY KEY (username));

CREATE TABLE URL_Table
(URL_Index INT NOT NULL,
URL_str  VARCHAR(256),
PRIMARY KEY (URL_Index),
FOREIGN KEY (username) REFERENCES User(username));

CREATE TABLE URL_DATA
(URL_str VARCHAR(256),
expiration VARCHAR(256),
name VARCHAR(30),
responseCode VARCHAR(100),
responseHeaders VARCHAR(100),
SSLProtocol VARCHAR(30),
PRIMARY KEY (URL_str),
FOREIGN KEY (URL_Index) REFERENCES URL_Table(URL_Index));


