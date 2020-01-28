CREATE table IF NOT EXISTS Dream_Careers (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Dream_Career VARCHAR(70),
    Ranking int NULL,
    PRIMARY KEY (UID, Dream_Career)
)