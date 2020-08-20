CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY, 
  email VARCHAR(255) NOT NULL, 
  password VARCHAR(255) NOT NULL, 
  last_name varchar(255), 
  first_name varchar(255), UNIQUE (email));

DO $$
DECLARE
  any_users users%ROWTYPE;
BEGIN
  SELECT * INTO any_users FROM users; 
  IF NOT found THEN
    INSERT INTO users (email, password, last_name, first_name) 
      VALUES ('bob.smith@test.com', 'hash', 'Smith', 'Bob');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS pet_types(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,  
  UNIQUE (name)
);
