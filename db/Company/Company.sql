CREATE table IF NOT EXISTS Company (
    Company_ID serial not NULL UNIQUE,
    Company_Name varchar(70) not NULL UNIQUE,
    Date_Created date not NULL DEFAULT current_date,
    Successful_Hires int not NULL DEFAULT 0,
    Num_Jobs int not NULL DEFAULT 0,
    Num_Employers int not NULL DEFAULT 0,
    Active_State boolean default true,
    PRIMARY KEY (Company_ID, Company_Name)  
);
