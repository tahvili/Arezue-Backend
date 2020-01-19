CREATE table Jobs (
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT PRIMARY KEY,
    EUID double precision REFERENCES employer(UID) ON DELETE RESTRICT PRIMARY KEY,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT PRIMARY KEY
)