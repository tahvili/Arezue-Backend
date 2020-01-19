CREATE table Skills (
    UID double precision REFERENCES jobseeker(uid) primary key,
    Skill varchar(70) primary key,
    Ranking int NULL
)