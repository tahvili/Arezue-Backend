CREATE table IF NOT EXISTS Interested (
    EUID uuid REFERENCES employer(uid) ON DELETE RESTRICT,
    JUID uuid REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE RESTRICT,
    Date_sent date not NULL DEFAULT current_date,
    PRIMARY KEY (EUID, Job_ID, JUID)
)