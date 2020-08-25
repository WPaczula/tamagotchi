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

CREATE TABLE IF NOT EXISTS pet_properties(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  value REAL NOT NULL,
  weight SMALLINT NOT NULL,
  value_per_time REAL NOT NULL,
  pet_type_id BIGINT NOT NULL,
  CONSTRAINT fk_pet_type
    FOREIGN KEY (pet_type_id)
      REFERENCES pet_types(id)
);

CREATE TABLE IF NOT EXISTS pet_modifiers(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  property VARCHAR(255) NOT NULL,
  modifier REAL NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS pet_modifier_index 
  ON pet_modifiers(name, property, modifier);

CREATE TABLE IF NOT EXISTS pet_actions(
  id BIGSERIAL PRIMARY KEY,
  pet_type_id BIGINT NOT NULL,
  name VARCHAR(255) NOT NULL,
  pet_modifier_ids BIGINT[] NOT NULL
);