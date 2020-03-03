CREATE table IF NOT EXISTS Certification (
    c_id serial not NULL,
    uid UUID references Jobseeker(uid),
    cert_name varchar(70) not NULL,
    start_date varchar(20),
    end_date varchar(20),
    issuer varchar(30),
    PRIMARY KEY (c_id, uid)  
);