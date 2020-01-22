CREATE table Resumes (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Resume_ID double precision UNIQUE,
    Resume json not NULL,
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT not NULL,
    Num_Starred int not NULL DEFAULT 0,
    PRIMARY KEY (UID, Resume_ID)
)