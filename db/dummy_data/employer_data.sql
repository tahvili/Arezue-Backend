insert into employer (name, fb_id, email_address, phone_number, location, uid, company_name)
values ('Recruiter1', 'fakefbid12', 'recruit@gmail.com', '(416) 899-46516', 'Toronto, ON',
 '66bf3bdd-8290-43a2-ad90-895c83a2232f' , 'alpha_company' ) ON CONFLICT DO NOTHING;

insert into employer (name, fb_id, email_address, phone_number, location, uid, company_name)
values ('Recruiter2', 'fakefbid223', 'recruit2@gmail.com', '(416) 811-4656', 'Waterloo, ON',
 '66bf3bdd-8290-43a2-ad90-895c83a2888f' , 'alpha_company' ) ON CONFLICT DO NOTHING;

insert into employer (name, fb_id, email_address, phone_number, location, company_name)
values ('Recruiter3', 'fakefbid444', 'recruit3@gmail.com', '(416) 111-4656', 'Waterloo, ON',
        'beta_company' ) ON CONFLICT DO NOTHING;