#!/bin/bash
# Commands available, ./init.sh, ./init.sh all, ./init.sh dummy

# Make sure you use LF instead of CRLF.
# This can be changed in VSCode bottom right corner.

# First switch to user postgres
    # $ sudo -su postgres

# Then run psql 
# (Or you can just do sudo -u postgres psql in one line without switching user)
    # $ psql

# You should see postgres=# 

# You may need to change the password for user postgres
    # postgres=# alter user postgres with password 'StrongAdminP@ssw0rd'

# Check connection info
    # postgres=# \conninfo

# Update your config file accordingly. You may need to run init.sh as postgres in your terminal.

## Set and load configuration file
config="./database.conf"
logfile="./logs/errorlog.`uname -n`.log"
if [ $# -eq 0 ] || [ "$1" == "new" ] || [ "$1" == "all" ]
    then
    if [ -f "$config" ]
    then
        echo "Loading $config file"
        . $config

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
        PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Job_list/Job_list.sql; 
        PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Experiences/Experiences.sql;
        PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Experiences/Experiences.sql;
        PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./Uuid_mapping/Uuid_mapping.sql;
        } > /dev/null 2> "$logfile"; [ -s "$logfile" ] || rm -f "$logfile"
        if [ -f "$logfile" ]
            then
              if grep ERROR "$logfile"
                then
                  echo "An error may have occurred while creating tables, please check $logfile for detailed errors"
                  echo "If you believe this is an error on our side, delete the log file then proceed once again"
              else
                echo "Database created successfully"
              fi
        fi
    else
        echo "$config not found."
    fi
fi


if [ "$1" == "dummy" ] || [ "$1" == "new" ] || [ "$1" == "all" ]
    then
         if [ -f "$logfile" ]
         then
            if grep ERROR "$logfile"
                then
                  echo "Please check $logfile before inserting dummy data"
                  echo "If you believe this is an error on our side, delete the log file then proceed once again"
            else
                echo "Inserting dummy data"
                . $config
                # ORDER MATTERS due to references in the tables.
                { PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/jobseeker_data.sql
                PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/company_data.sql
                PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/employer_data.sql
                PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/job_data.sql
                PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/resume_data.sql
                PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./dummy_data/experiences_data.sql
                } > /dev/null 2> "$logfile"; [ -s "$logfile" ] || rm -f "$logfile"
                if [ -f "$logfile" ]
                  then
                    echo "An error may have occurred while inserting dumy data, please check $logfile for detailed errors"
                  else
                    echo "Dummy data inserted correctly"
                fi
            fi
         fi
fi

if [ "$1" == "clear" ]
    then
        echo "Clearing database"
        . $config
        PGPASSWORD=${password} psql -U ${username} -p ${port} -h ${hostname} ${database} < ./clear/clear.sql > /dev/null
        echo "Successfully cleared all data from the database"
fi
