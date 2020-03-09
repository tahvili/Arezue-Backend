CREATE table IF NOT EXISTS Skills (
    UID uuid REFERENCES jobseeker(uid),
    Skill varchar(70),
    Ranking int NULL, -- How well they rank themselves
    years_of_expertise int not NULL DEFAULT 0,
    level_expertise  int not NULL DEFAULT 0,
    PRIMARY KEY (UID, Skill)
    -- Level (Intermediate or amateur) of the skill, or years of skills
    -- Potentially questions for people to answer to test their level of skills
    -- Potentially modify the Keywords table for the skills for the job that they require
    -- Skill now have an id

);