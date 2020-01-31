CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE table IF NOT EXISTS Jobseeker (
--     UID uuid DEFAULT uuid_generate_v4 () primary key,
--     uid uuid references users(uid),
    Num_Employer_Scanned int not NULL DEFAULT 0,
    Num_Employer_Viewed_Resume int not NULL DEFAULT 0,
    Pending_Interest int not NULL DEFAULT 0,
    Potential_Client boolean not NULL DEFAULT False,
    PRIMARY KEY(uid)
) INHERITS (Users);

