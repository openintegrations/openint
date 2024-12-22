-- Custom SQL migration file, put your code below! --

UPDATE connection
SET customer_id = '__ORG__'
WHERE customer_id IS NULL;
ALTER TABLE connection
ALTER COLUMN customer_id SET NOT NULL;
ALTER TABLE connection
ALTER COLUMN customer_id SET DEFAULT '__ORG__';
