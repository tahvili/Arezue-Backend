CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE table IF NOT EXISTS Employer (
--     UID uuid DEFAULT uuid_generate_v4 () primary key,
--     uid uuid references users(uid),
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE CASCADE,
    Successful_Searches int not NULL DEFAULT 0,
    Interview_Req_Sent int not NULL DEFAULT 0,
    Accepted_Interview_Req int not NULL DEFAULT 0,
    PRIMARY KEY(uid)
) INHERITS (users);