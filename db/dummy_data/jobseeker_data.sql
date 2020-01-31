
insert into jobseeker (name, email_address, phone_number, location,
 uid)
values ('John Doe', 'jdoe@gmail.com', '4163557894',
 'Mississauga, ON', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11') ON CONFLICT DO NOTHING;

insert into jobseeker (name, email_address, phone_number, location,
 uid)
values ('Walter Black', 'wblack@gmail.com', '4163531139',
 'Toronto, ON', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22') ON CONFLICT DO NOTHING;

insert into jobseeker (name, email_address, phone_number, location)
values ('Jack Ryan', 'jryank@gmail.com', '306-515-8868',
 'Toronto, ON') ON CONFLICT DO NOTHING;