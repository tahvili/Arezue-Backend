-- This is for jobseeker's pending requests page
CREATE table Pending_Requests (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT PRIMARY KEY,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT PRIMARY KEY,
    Num_Times_Viewed int not null
);