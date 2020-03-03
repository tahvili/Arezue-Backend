insert into company (company_name, Successful_Hires, num_employers)
values ('alpha_company', 5, 2) ON CONFLICT DO NOTHING;

insert into company (company_name, Successful_Hires, num_employers)
values ('beta_company', 3, 50) ON CONFLICT DO NOTHING;