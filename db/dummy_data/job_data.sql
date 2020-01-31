insert into job (job_id, euid,
 company_id, title, wage, position,
  hours, location, description, status, max_candidate)
values ('ef78507b-c958-4881-9b4f-b149d192ecc5', '66bf3bdd-8290-43a2-ad90-895c83a2232f',
 '83e3c0c0-fa24-44d3-9d32-248376cf70a7', 'Senior Software Engineer', '$190,000', 'Web dev', '40 per week',
  'Waterloo, ON', 'How would the dscription of a job be formatted?', 
'Full-time', 1) ON CONFLICT DO NOTHING;

insert into job (job_id, euid,
 company_id, title, wage, position,
  hours, location, description, status, max_candidate)
values ('ef78507b-c958-4881-9b4f-b149d192eee6', '66bf3bdd-8290-43a2-ad90-895c83a2888f',
 '83e3c0c0-fa24-44d3-9d32-248376cf70b8', 'Senior Backend Engineer', '$200,000', 'Desktop apps', '40+ per week',
  'Waterloo, ON', 'How would the dscription of a job be formatted?',
'Full-time', 1) ON CONFLICT DO NOTHING;