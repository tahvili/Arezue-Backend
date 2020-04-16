CREATE table IF NOT EXISTS Benefits (
    Job_ID serial REFERENCES job(Job_ID) ON DELETE CASCADE primary key,
    Benefit text NULL
);