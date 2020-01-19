CREATE table Dream_Companies (
    UID double precision REFERENCES jobseeker(uid) ON DELETE RESTRICT PRIMARY KEY,
    Dream_Company VARCHAR(70) PRIMARY KEY,
    Preference int NULL
)