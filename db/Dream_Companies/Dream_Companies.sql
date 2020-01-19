CREATE table Dream_Companies (
    UID int REFERENCES jobseeker(uid) ON DELETE RESTRICT PRIMARY KEY,
    Dream_Company VARCHAR(70) PRIMARY KEY,
    Preference int not NULL
)