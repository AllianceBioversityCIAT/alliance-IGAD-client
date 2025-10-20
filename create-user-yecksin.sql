-- Create user: yecksin@gmail.com
-- Password: Welcome123 (Hash SHA-256)

INSERT INTO users (email, name, password_hash) 
VALUES (
  'yecksin@gmail.com', 
  'Yecksin', 
  '3b9ffed9b2b5c231dcc8ecd604e7ab688d9f1e4aa3b048ff2fd32e52b2097da5'
);

-- Verify user was created
SELECT id, email, name, created_at FROM users WHERE email = 'yecksin@gmail.com';

