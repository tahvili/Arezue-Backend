CREATE table Skills (
    UID double precision REFERENCES jobseeker(uid),
    Skill varchar(70),
    Ranking int NULL,
    PRIMARY KEY (UID, Skill)
)