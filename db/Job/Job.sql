CREATE table Job (
    Job_ID uuid primary key,
    EUID uuid REFERENCES employer(UID) ON DELETE RESTRICT not NULL,
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE RESTRICT not NULL,
    Title VARCHAR(70) not NULL,
    Wage text not NULL,
    Position VARCHAR(70) not NULL,
    Hours uuid not NULL,
    Location VARCHAR(50) not NULL,
    Description text not NULL,
    Date_Posted date not NULL default current_date,
    Expiry_Date date not NULL default current_date + 30, -- 30 Days by default
    Status VARCHAR(20) not NULL,
    Max_Candidate int not NULL
)