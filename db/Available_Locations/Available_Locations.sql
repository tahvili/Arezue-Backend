CREATE table IF NOT EXISTS Available_Locations (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Dream_Company VARCHAR(70),
    Preference int NULL,
    PRIMARY KEY (UID, Dream_Company)
);