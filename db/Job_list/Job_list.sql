CREATE table IF NOT EXISTS Job_list (
    Company_ID uuid REFERENCES company(Company_ID) ON DELETE CASCADE,
    EUID uuid REFERENCES employer(UID) ON DELETE CASCADE,
    Job_ID uuid REFERENCES job(Job_ID) ON DELETE CASCADE,
    PRIMARY KEY (Company_ID, EUID, Job_ID)
)