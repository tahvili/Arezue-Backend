-- Should we keep track of employers per company

CREATE table Company (
    Company_ID double precision primary key,
    Company_Name varchar(70) not NULL,
    Date_Created date not NULL DEFAULT current_date,
    Successful_Hires int not NULL DEFAULT 0,
    Num_Jobs int not NULL DEFAULT 0,
    Num_Employers int not NULL DEFAULT 0
);