insert into resumes (uid, resume, company_id, num_starred)
values('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
'{
    "name": "Thomas Davis",
    "label": "Web Developer",
    "email": "thomasalwyndavis@gmail.com"}',
    '2', 1 ) ON CONFLICT DO NOTHING;