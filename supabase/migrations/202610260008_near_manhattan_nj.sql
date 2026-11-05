-- Add only five nearby NJ municipalities. No listing data or permissions change.
begin;
insert into public.locations(id,name_en,name_zh,state,city) values
 ('jersey-city','Jersey City','泽西市','NJ','Jersey City'),
 ('hoboken','Hoboken','霍博肯','NJ','Hoboken'),
 ('weehawken','Weehawken','威霍肯','NJ','Weehawken'),
 ('union-city','Union City','联合市','NJ','Union City'),
 ('west-new-york','West New York','西纽约（NJ）','NJ','West New York')
on conflict (id) do nothing;
commit;
