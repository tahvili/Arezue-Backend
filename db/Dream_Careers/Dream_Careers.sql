CREATE table IF NOT EXISTS Dream_Careers (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    career_id int REFERENCES Pre_Dream_Careers(id),
    Ranking int NULL,
    PRIMARY KEY (UID, career_id)
);