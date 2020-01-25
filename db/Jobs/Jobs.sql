CREATE table Jobs (
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE RESTRICT,
    EUID uuid REFERENCES employer(UID) ON DELETE RESTRICT,
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE RESTRICT,
    PRIMARY KEY (Company_ID, EUID, Job_ID)
)