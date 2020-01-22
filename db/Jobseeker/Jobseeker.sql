CREATE table Jobseeker (
    UID double precision primary key,
    Num_Employer_Scanned int not NULL DEFAULT 0,
    Num_Employer_Viewed_Resume int not NULL DEFAULT 0,
    Pending_Interest int not NULL DEFAULT 0,
    Potential_Client boolean not NULL DEFAULT False
) INHERITS (Users);

