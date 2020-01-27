CREATE table IF NOT EXISTS Starred_Resumes (
    EUID uuid REFERENCES employer(UID) ON DELETE RESTRICT,
    Resume_ID uuid REFERENCES Resumes(Resume_ID) ON DELETE RESTRICT,
    Num_Times_Opened int not NULL DEFAULT 0,
    JUID uuid REFERENCES jobseeker(UID),
    PRIMARY KEY (EUID, Resume_ID)
)