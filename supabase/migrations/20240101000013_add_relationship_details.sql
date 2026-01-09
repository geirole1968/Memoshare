-- Add status column to relationships table
alter table relationships 
add column if not exists status text;

-- Add comment to explain usage
comment on column relationships.status is 'Status of the relationship, e.g. "married", "divorced", "cohabitant" for spouse relationships.';
