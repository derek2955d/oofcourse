begin;
-- Strengthen category JSON validation for direct API callers, not only web forms.
create function private.validate_extension() returns trigger language plpgsql set search_path='' as $$declare allowed text[];required text[];begin
 if new.status in ('draft','archived') then return new;end if;
 case new.category_id
 when 'housing' then allowed:=array['tenure','property_type','bedrooms','bathrooms','furnished','availability','fee_disclosure','broker_fee_payer','nearby'];required:=allowed[1:8];
 when 'jobs' then allowed:=array['company','salary_min','salary_max','pay_period','employment','workplace','industry','benefits'];required:=allowed[1:7];
 when 'marketplace' then allowed:=array['condition','pickup'];required:=allowed;
 when 'services' then allowed:=array['provider_type','price_type','service_area'];required:=allowed;
 when 'businesses' then allowed:=array['business_name','service_type','website','opening_hours'];required:=allowed[1:2];
 when 'community' then allowed:=array['topic','event_date'];required:=allowed[1:1];
 else raise exception 'Unknown category';end case;
 if not(new.details ?& required) or exists(select 1 from jsonb_object_keys(new.details) k where k<>all(allowed)) or exists(select 1 from unnest(required) k where new.details->k='null'::jsonb) then raise exception 'Invalid structured fields';end if;
 return new;end$$;
create trigger validate_extension before insert or update on public.listings for each row execute function private.validate_extension();
revoke insert on public.listing_checks from authenticated;
drop policy checks_insert on public.listing_checks;
create function private.auto_check() returns trigger language plpgsql security definer set search_path='' as $$declare content text:=lower(new.title||' '||new.description);flags text[]:='{}';begin
 if new.status='pending' and (tg_op='INSERT' or old.status is distinct from new.status or old.description<>new.description or old.title<>new.title) then
 if content ~ '(gift card|wire transfer|crypto only|汇款|礼品卡|加密货币)' then flags:=array_append(flags,'suspicious_payment');end if;
 if content ~ '(https?://|[[:alnum:]._%+-]+@[[:alnum:].-]+\.[[:alpha:]]{2,}|[0-9]{3}[-. ][0-9]{3}[-. ][0-9]{4})' then flags:=array_append(flags,'contact_or_link_review');end if;
 if new.category_id in ('housing','jobs') and content ~ '(no children|no kids|male only|female only|chinese only|white only|asian only|只限女性|只限男性|只限华人|不要小孩)' then flags:=array_append(flags,'fairness_review');end if;
 if new.category_id='housing' and new.details->>'broker_fee_payer'='tenant' then flags:=array_append(flags,'broker_fee_review');end if;
 if exists(select 1 from public.listings other where other.id<>new.id and other.fingerprint=new.fingerprint and other.status in ('pending','approved') and other.created_at>now()-interval '30 days') then flags:=array_append(flags,'duplicate_content');end if;
 insert into public.listing_checks(listing_id,flags) values(new.id,flags);end if;return new;end$$;
create trigger auto_listing_check after insert or update on public.listings for each row execute function private.auto_check();
create function public.moderate_business(p_id uuid,p_decision text,p_reason text) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 if p_decision not in ('approved','rejected','archived','pending') or length(btrim(p_reason)) not between 3 and 2000 then raise exception 'Invalid decision';end if;
 update public.business_profiles set status=p_decision where id=p_id;if not found then raise exception 'Business missing';end if;
 insert into public.moderation_actions(business_id,moderator_id,action,reason) values(p_id,auth.uid(),p_decision,p_reason);end$$;
create function public.update_posting_settings(p_daily int,p_days int) returns void language plpgsql security definer set search_path='' as $$begin
 if not private.is_admin() then raise exception 'Administrator required';end if;
 if p_daily not between 1 and 20 or p_days not between 1 and 90 then raise exception 'Invalid settings';end if;
 update public.site_settings set value=jsonb_build_object('daily_submissions',p_daily,'expiry_days',p_days,'review_required',true),updated_at=now() where key='posting';
 insert into public.audit_logs(actor_id,entity,record_id,operation) values(auth.uid(),'site_settings','posting','UPDATE');end$$;
create trigger audit_reports after update on public.reports for each row execute function private.audit();
create trigger audit_categories after insert or update or delete on public.categories for each row execute function private.audit();
create trigger audit_locations after insert or update or delete on public.locations for each row execute function private.audit();
revoke all on function public.moderate_business(uuid,text,text),public.update_posting_settings(int,int) from public;
grant execute on function public.moderate_business(uuid,text,text),public.update_posting_settings(int,int) to authenticated;
revoke all on function private.validate_extension(),private.auto_check() from public;
commit;
