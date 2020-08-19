CREATE TABLE IF NOT EXISTS users(
  id BIGSERIAL PRIMARY KEY, 
  email VARCHAR(255) NOT NULL, 
  password VARCHAR(255) NOT NULL, 
  lastName varchar(255), 
  firstName varchar(255), UNIQUE (email));

DO $$
DECLARE
  anyUsers users%ROWTYPE;
BEGIN
  SELECT * INTO anyUsers FROM users; 
  IF NOT found THEN
    INSERT INTO users (email, password, lastName, firstName) 
      VALUES ('bob.smith@test.com', 'hash', 'Bob', 'Smith');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS petTypes(
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL, 
  userId BIGSERIAL, 
  UNIQUE (name), 
  FOREIGN KEY (userId)
    REFERENCES users (id)
    ON DELETE CASCADE
);