-- This is for jobseeker's pending requests page
CREATE table IF NOT EXISTS Pending_Requests (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE CASCADE,
    Num_Times_Viewed int not null,
    PRIMARY KEY (UID, Job_ID)
);