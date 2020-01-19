CREATE table Available_Locations (
    UID double precision REFERENCES jobseeker(uid) PRIMARY KEY,
    Dream_Company VARCHAR(70) PRIMARY KEY,
    Preference int NULL
);