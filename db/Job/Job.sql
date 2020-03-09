DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        create type job_status AS ENUM ('Full-time', 'Part-time', 'Contract');
    END IF;
END
$$;

CREATE table IF NOT EXISTS Job (
    Job_ID serial primary key,
    EUID uuid REFERENCES employer(UID) ON DELETE CASCADE not NULL,
    Company_ID serial REFERENCES company(Company_ID) ON DELETE CASCADE not NULL,
    Title VARCHAR(70) not NULL,
    Wage text not NULL,
    Position VARCHAR(70) not NULL,
    Hours VARCHAR(30) not NULL,
    Location VARCHAR(50) not NULL,
    Description text not NULL,
    Date_Posted date not NULL default current_date,
    Expiry_Date date not NULL default current_date + 30, -- 30 Days by default
    Status VARCHAR(20) not NULL,
    Max_Candidate int not NULL

    -- Potentially for employer to rank the skill that is more important when they are creating the job
    
);