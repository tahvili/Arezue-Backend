CREATE table IF NOT EXISTS Dream_Companies (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    company_id int references Pre_Dream_Companies(id),
    Ranking int NULL,
    PRIMARY KEY (UID, company_id)
);