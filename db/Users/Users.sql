CREATE table IF NOT EXISTS Users (
    Name VARCHAR(70) not NULL,
    Email_Address VARCHAR(255) not NULL,
    Phone_Number VARCHAR(50) NULL,
    Location VARCHAR(50) NULL,
    Profile_Picture VARCHAR(2083) NULL,
    Active_States BOOLEAN not NULL DEFAULT True,
    Date_Created DATE not NULL DEFAULT current_date,
    Date_Last_Login DATE not NULL DEFAULT current_date,
    CHECK (false) NO INHERIT
);
