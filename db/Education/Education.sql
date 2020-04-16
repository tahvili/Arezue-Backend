CREATE table IF NOT EXISTS Education (
    ed_id serial not NULL,
    uid UUID references Jobseeker(uid),
    school_name varchar(100) not NULL,
    start_date varchar(20) not NULL,
    grad_date varchar(20) not NULL,
    program varchar(100) not null,
    PRIMARY KEY (ed_id, uid)  
);
