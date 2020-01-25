CREATE table Benefits (
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE RESTRICT primary key,
    Benefit text NULL
)