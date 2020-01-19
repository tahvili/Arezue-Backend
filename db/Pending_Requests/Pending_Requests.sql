-- This is for jobseeker's pending requests page
CREATE table Pending_Requests (
    -- TODO: Need to add Job_ID as foreign key
    UID int REFERENCES jobseeker(uid) ON DELETE RESTRICT PRIMARY KEY,
    Num_Times_Viewed int not null
);