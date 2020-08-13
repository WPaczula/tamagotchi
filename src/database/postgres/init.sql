CREATE TABLE IF NOT EXISTS users(id bigserial primary key, email varchar(255), password varchar(255), lastName varchar(255), firstName varchar(255));

DO $$
DECLARE
  anyUsers users%ROWTYPE;
BEGIN
  SELECT * INTO anyUsers FROM users; 
  IF NOT found THEN
    INSERT INTO users (email, password, lastName, firstName) 
      VALUES ('bob.smith@test.com', 'hash', 'Bob', 'Smith');
  END IF;
END $$