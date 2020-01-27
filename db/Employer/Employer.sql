CREATE table IF NOT EXISTS Employer (
    UID uuid primary key,
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE RESTRICT,
    Successful_Searches int not NULL DEFAULT 0,
    Interview_Req_Sent int not NULL DEFAULT 0,
    Accepted_Interview_Req int not NULL DEFAULT 0
) INHERITS (users)