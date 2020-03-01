
insert into jobseeker (name, fb_id, email_address, phone_number, location,
 uid)
values ('John Doe', 'fakefbid', 'jdoe@gmail.com', '4163557894',
 'Mississauga, ON', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') ON CONFLICT DO NOTHING;

insert into jobseeker (name, fb_id, email_address, phone_number, location,
 uid)
values ('Walter Black', 'fakefbid111', 'wblack@gmail.com', '4163531139',
 'Toronto, ON', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22') ON CONFLICT DO NOTHING;

insert into jobseeker (name, fb_id, email_address, phone_number, location)
values ('Jack Ryan', 'morefakefbid222', 'jryank@gmail.com', '306-515-8868',
 'Toronto, ON') ON CONFLICT DO NOTHING;