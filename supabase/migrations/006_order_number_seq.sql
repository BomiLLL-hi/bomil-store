-- Reset order number sequence to simple 1, 2, 3...
DROP SEQUENCE IF EXISTS order_number_seq CASCADE;
CREATE SEQUENCE order_number_seq START 1;

ALTER TABLE orders
  ALTER COLUMN order_number SET DEFAULT NEXTVAL('order_number_seq')::TEXT;
