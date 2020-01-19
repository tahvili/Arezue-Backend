CREATE table Keywords (
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT primary key,
    keyword VARCHAR(50) not NULL
)