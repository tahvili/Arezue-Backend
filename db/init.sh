#!/bin/bash

## Set and load configuration file
config="./database.conf"

if [ -f "$config" ]
then
    echo "Loading $config file"
    . $config
    logfile="./logs/errorlog.`uname -n`.$(date).log"
    {
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Users/Users.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Jobseeker/Jobseeker.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Company/Company.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Dream_Companies/Dream_Companies.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Available_Locations/Available_Locations.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Skills/Skills.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Dream_Careers/Dream_Careers.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Employer/Employer.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Job/Job.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Keywords/Keywords.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Benefits/Benefits.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Pending_Requests/Pending_Requests.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Resumes/Resumes.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Interested/Interested.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Starred_Resumes/Starred_Resumes.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Pending_Requests_Sent/Pending_Requests_Sent.sql;
    PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Jobs/Jobs.sql; 
    } > /dev/null 2> "$logfile"; [ -s "$logfile" ] || rm -f "$logfile"
    if [ -f "$logfile" ]
    then
        echo "An error exists, please check $logfile for detailed errors"
    fi
else
    echo "$config not found."
fi

