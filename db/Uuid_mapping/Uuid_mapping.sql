CREATE table IF NOT EXISTS uuid_mapping (
    fb_uid VARCHAR(50),
    db_uid uuid REFERENCES users(uid),
    PRIMARY KEY(fb_uid, db_uid)
);
