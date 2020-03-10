CREATE TABLE IF NOT EXISTS Job_Skills (
    Job_ID serial REFERENCES Job(job_id) ON DELETE CASCADE NOT NULL,
    Skill varchar(70) NOT NULL,
    Ranking int not null,
    PRIMARY KEY (Job_ID, Skill)
)