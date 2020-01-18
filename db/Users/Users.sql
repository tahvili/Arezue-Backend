CREATE table Users (
    Name VARCHAR(70) not NULL,
    Email_Address VARCHAR(255) not NULL,
    Phone_Number VARCHAR(50) NULL,
    Location VARCHAR(50) NULL,
    Profile_Picture VARCHAR(2083) NULL,
    Active_States BOOLEAN not NULL,
    Data_Created DATE not NULL,
    Date_Last_Login DATE not NULL,
    CHECK (false) NO INHERIT
);
