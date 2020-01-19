CREATE table Resumes (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT primary key,
    Resume_ID double precision primary key,
    Resume json not NULL,
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT not NULL,
    Num_Starred int not NULL DEFAULT 0
)