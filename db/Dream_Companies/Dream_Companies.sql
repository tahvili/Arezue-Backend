CREATE table Dream_Companies (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT,
    Dream_Company VARCHAR(70),
    Preference int NULL,
    PRIMARY KEY (UID, Dream_Company)
)