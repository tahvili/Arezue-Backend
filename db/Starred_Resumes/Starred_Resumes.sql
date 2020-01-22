CREATE table Starred_Resumes (
    EUID double precision REFERENCES employer(UID) ON DELETE RESTRICT,
    Resume_ID double precision REFERENCES Resumes(Resume_ID) ON DELETE RESTRICT,
    Num_Times_Opened int not NULL DEFAULT 0,
    JUID double precision REFERENCES jobseeker(UID),
    PRIMARY KEY (EUID, Resume_ID)
)