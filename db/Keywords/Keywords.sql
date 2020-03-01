CREATE table IF NOT EXISTS Keywords (
    Job_ID serial REFERENCES job(Job_ID) ON DELETE CASCADE primary key,
    keyword VARCHAR(50) not NULL
);