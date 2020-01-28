insert into company (company_id, company_name, Successful_Hires, num_employers)
values ('83e3c0c0-fa24-44d3-9d32-248376cf70a7' , 'alpha_company', 5, 2) ON CONFLICT DO NOTHING;

insert into company (company_id, company_name, Successful_Hires, num_employers)
values ('83e3c0c0-fa24-44d3-9d32-248376cf70b8' , 'Beta_company', 3, 50) ON CONFLICT DO NOTHING;