CREATE table IF NOT EXISTS Resumes (
    UID uuid REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Resume_ID uuid UNIQUE,
    Resume json not NULL,
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE RESTRICT not NULL,
    Num_Starred int not NULL DEFAULT 0,
    PRIMARY KEY (UID, Resume_ID)
)