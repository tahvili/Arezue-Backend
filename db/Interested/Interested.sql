CREATE table Interested (
    EUID double precision REFERENCES employer(uid) ON DELETE RESTRICT PRIMARY KEY,
    JUID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT PRIMARY KEY,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT PRIMARY KEY,
    Date_sent date not NULL DEFAULT current_date
)