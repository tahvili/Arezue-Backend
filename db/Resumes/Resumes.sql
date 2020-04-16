CREATE table IF NOT EXISTS Resumes (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Resume_Name varchar(60) UNIQUE,
    Resume_ID serial UNIQUE,
    Resume json not NULL,
    Num_Starred int not NULL DEFAULT 0,
    PRIMARY KEY (UID, Resume_ID)
);