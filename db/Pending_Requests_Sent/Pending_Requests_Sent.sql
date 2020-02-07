CREATE table IF NOT EXISTS Pending_Requests_Sent (
    EUID uuid REFERENCES employer(uid) ON DELETE CASCADE,
    JUID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Job_ID serial REFERENCES job(Job_ID) ON DELETE CASCADE,
    Date_sent date not NULL DEFAULT current_date,
    PRIMARY KEY (EUID, JUID, Job_ID)
);