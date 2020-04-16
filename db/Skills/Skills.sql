CREATE table IF NOT EXISTS Skills (
    UID uuid REFERENCES jobseeker(uid),
    skill_id int REFERENCES Pre_Skills(id),
    years int not NULL DEFAULT 0,
    level int not NULL DEFAULT 0,
    PRIMARY KEY (UID, skill_id)
    -- Level (Intermediate or amateur) of the skill, or years of skills
    -- Potentially questions for people to answer to test their level of skills
    -- Potentially modify the Keywords table for the skills for the job that they require
    -- Skill now have an id

);  