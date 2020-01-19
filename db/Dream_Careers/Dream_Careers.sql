CREATE table Dream_Careers (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Dream_Career VARCHAR(70),
    Ranking int NULL,
    PRIMARY KEY (UID, Dream_Career)
)