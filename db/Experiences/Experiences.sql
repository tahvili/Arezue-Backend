CREATE table IF NOT EXISTS Experiences (
    UID uuid REFERENCES jobseeker(uid) ON DELETE CASCADE,
    Title VARCHAR(80) not NULL,
    start_date VARCHAR(10) not null,
    end_date VARCHAR(10) not null,
    description TEXT not NULL
);