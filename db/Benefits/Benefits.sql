CREATE table Benefits (
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT primary key,
    Benefit text NULL
)