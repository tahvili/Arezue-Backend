-- We need this table because what if Interested was removed from user because they arent interested anymore,
-- Are we not keeping track of everything sent?

CREATE table Pending_Requests_Sent (
    EUID double precision REFERENCES employer(uid) ON DELETE RESTRICT,
    JUID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT,
    Date_sent date not NULL DEFAULT current_date,
    PRIMARY KEY (EUID, JUID, Job_ID)
)