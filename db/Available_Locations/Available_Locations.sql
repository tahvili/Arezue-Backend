CREATE table Available_Locations (
    UID uuid REFERENCES jobseeker(uid),
    Dream_Company VARCHAR(70),
    Preference int NULL,
    PRIMARY KEY (UID, Dream_Company)
);