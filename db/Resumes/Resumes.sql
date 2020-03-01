CREATE table IF NOT EXISTS Resumes (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Resume_ID serial UNIQUE,
    Resume json not NULL,
    Company_ID serial REFERENCES company(Company_ID) ON DELETE CASCADE not NULL,
    Num_Starred int not NULL DEFAULT 0,
    PRIMARY KEY (UID, Resume_ID)
);