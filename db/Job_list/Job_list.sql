CREATE table Job_list (
    Company_ID double precision REFERENCES company(Company_ID) ON DELETE RESTRICT,
    EUID double precision REFERENCES employer(UID) ON DELETE RESTRICT,
    Job_ID double precision REFERENCES job(Job_ID) ON DELETE RESTRICT,
    PRIMARY KEY (Company_ID, EUID, Job_ID)
)