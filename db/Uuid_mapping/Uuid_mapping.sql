CREATE table IF NOT EXISTS Uuid_mapping (
    fb_uid VARCHAR(30),
    db_uid uuid REFERENCES users(uid),
    PRIMARY KEY(fb_uid, db_uid)
);