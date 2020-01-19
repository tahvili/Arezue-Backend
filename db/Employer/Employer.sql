CREATE table Employer (
    UID double precision primary key,
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT,
    Successful_Searches int not NULL DEFAULT 0,
    Interview_Req_Sent int not NULL DEFAULT 0,
    Accepted_Interview_Req int not NULL DEFAULT 0
) INHERITS (users)