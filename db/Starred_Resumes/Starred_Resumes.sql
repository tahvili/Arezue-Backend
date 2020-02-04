CREATE table IF NOT EXISTS Starred_Resumes (
    EUID uuid REFERENCES employer(UID) ON DELETE CASCADE,
    Resume_ID serial REFERENCES Resumes(Resume_ID) ON DELETE CASCADE,
    Num_Times_Opened int not NULL DEFAULT 0,
    JUID uuid REFERENCES jobseeker(UID),
    PRIMARY KEY (EUID, Resume_ID)
);