CREATE table Dream_Careers (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT primary key,
    Dream_Career VARCHAR(70) primary key,
    Ranking int NULL
)