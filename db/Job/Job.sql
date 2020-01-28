CREATE table IF NOT EXISTS Job (
    Job_ID uuid primary key,
    EUID uuid REFERENCES employer(UID) ON DELETE CASCADE not NULL,
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE CASCADE not NULL,
    Title VARCHAR(70) not NULL,
    Wage text not NULL,
    Position VARCHAR(70) not NULL,
    Hours int not NULL,
    Location VARCHAR(50) not NULL,
    Description text not NULL,
    Date_Posted date not NULL default current_date,
    Expiry_Date date not NULL default current_date + 30, -- 30 Days by default
    Status VARCHAR(20) not NULL,
    Max_Candidate int not NULL
)