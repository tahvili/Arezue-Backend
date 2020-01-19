CREATE table Interested (
    EUID double precision REFERENCES employer(uid) ON DELETE RESTRICT,
    JUID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT,
    Date_sent date not NULL DEFAULT current_date,
    PRIMARY KEY (EUID, Job_ID, JUID)
)