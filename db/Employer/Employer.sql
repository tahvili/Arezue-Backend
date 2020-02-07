CREATE table IF NOT EXISTS Employer (
    UNIQUE (Email_Address),
    UNIQUE (fb_id),
    Company_ID serial REFERENCES company(company_id) ON DELETE CASCADE,
    Successful_Searches int not NULL DEFAULT 0,
    Interview_Req_Sent int not NULL DEFAULT 0,
    Accepted_Interview_Req int not NULL DEFAULT 0,
    PRIMARY KEY(uid)
) INHERITS (users);