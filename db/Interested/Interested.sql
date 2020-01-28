CREATE table IF NOT EXISTS Interested (
    EUID uuid REFERENCES employer(uid) ON DELETE CASCADE,
    JUID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE CASCADE,
    Date_sent date not NULL DEFAULT current_date,
    PRIMARY KEY (EUID, Job_ID, JUID)
);