CREATE table Job (
    Job_ID double precision primary key,
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT not NULL,
    Title VARCHAR(70) not NULL,
    Wage text not NULL,
    Position VARCHAR(70) not NULL,
    Hours double precision not NULL,
    Location VARCHAR(50) not NULL,
    Description text not NULL,
    Date_Posted date not NULL default current_date,
    Expiry_Date date not NULL default current_date + 30, -- 30 Days by default
    Status VARCHAR(20) not NULL,
    Max_Candidate int not NULL
)