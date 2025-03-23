-- RUN THIS AFTER STARTING THE SERVER --

-- Clear existing data
TRUNCATE users, channels, contacts, chats, group_members CASCADE;

-- Create test users password is Test@1234
INSERT INTO users (id, name, email, password, status, created_by, public_key)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Alice Smith', 'alice@example.com', '$2b$10$gIbMLWMSTNyg1z6eUgeEl.Bo4ZMkK8MqN2B6oINJtr8KOJiKExuPa', '2', '11111111-1111-1111-1111-111111111111', 'alice_public_key'),
  ('22222222-2222-2222-2222-222222222222', 'Bob Johnson', 'bob@example.com', '$2b$10$gIbMLWMSTNyg1z6eUgeEl.Bo4ZMkK8MqN2B6oINJtr8KOJiKExuPa', '2', '22222222-2222-2222-2222-222222222222', 'bob_public_key'),
  ('33333333-3333-3333-3333-333333333333', 'Charlie Brown', 'charlie@example.com', '$2b$10$gIbMLWMSTNyg1z6eUgeEl.Bo4ZMkK8MqN2B6oINJtr8KOJiKExuPa', '2', '33333333-3333-3333-3333-333333333333', 'charlie_public_key'),
  ('44444444-4444-4444-4444-444444444444', 'Diana Prince', 'diana@example.com', '$2b$10$gIbMLWMSTNyg1z6eUgeEl.Bo4ZMkK8MqN2B6oINJtr8KOJiKExuPa', '2', '44444444-4444-4444-4444-444444444444', 'diana_public_key');

-- Create private channels for direct messages
INSERT INTO channels (id, type, status, created_by, metadata)
VALUES
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '0', '2', '11111111-1111-1111-1111-111111111111', '{}'),
  ('b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '0', '2', '11111111-1111-1111-1111-111111111111','{}'),
  ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '1', '2', '22222222-2222-2222-2222-222222222222', '{"group_name": "Team Chat", "group_description": "Team discussion group"}');

-- Create contacts (relationships between users)
INSERT INTO contacts (id, user_id, name, channel_id, status, created_by, is_pinned, is_muted, is_blocked)
VALUES
  -- Alice's contacts
  ('a2a2a2a2-a2a2-a2a2-a2a2-a2a2a2a2a2a2', '22222222-2222-2222-2222-222222222222', 'Bob', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '2', '11111111-1111-1111-1111-111111111111', true, false, false),
  ('a3a3a3a3-a3a3-a3a3-a3a3-a3a3a3a3a3a3', '33333333-3333-3333-3333-333333333333', 'Charlie', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '2', '11111111-1111-1111-1111-111111111111', false, false, false),
  -- Bob's contacts
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '11111111-1111-1111-1111-111111111111', 'Alice', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '2', '22222222-2222-2222-2222-222222222222', false, false, false),
  -- Charlie's contacts
  ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', '11111111-1111-1111-1111-111111111111', 'Alice', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '2', '33333333-3333-3333-3333-333333333333', true, false, false);

-- Add members to the group chat
INSERT INTO group_members (id, channel_id, user_id, status, created_by, has_pinned, has_muted)
VALUES
  ('d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '11111111-1111-1111-1111-111111111111', '2', '22222222-2222-2222-2222-222222222222', true, false),
  ('d2d2d2d2-d2d2-d2d2-d2d2-d2d2d2d2d2d2', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '22222222-2222-2222-2222-222222222222', '2', '22222222-2222-2222-2222-222222222222', false, false),
  ('d3d3d3d3-d3d3-d3d3-d3d3-d3d3d3d3d3d3', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '33333333-3333-3333-3333-333333333333', '2', '22222222-2222-2222-2222-222222222222', false, true);

-- Add some chat messages
INSERT INTO chats (id, message, iv, channel_id, created_by, status, unread)
VALUES
  -- Alice-Bob chat
  ('e1e1e1e1-e1e1-e1e1-e1e1-e1e1e1e1e1e1', 'Hey Bob!', 'iv1', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '11111111-1111-1111-1111-111111111111', '2', false),
  ('e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2', 'Hi Alice!', 'iv2', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '22222222-2222-2222-2222-222222222222', '2', true),
  
  -- Alice-Charlie chat
  ('e3e3e3e3-e3e3-e3e3-e3e3-e3e3e3e3e3e3', 'Hello Charlie!', 'iv3', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '11111111-1111-1111-1111-111111111111', '2', false),
  ('e4e4e4e4-e4e4-e4e4-e4e4-e4e4e4e4e4e4', 'Hey Alice, how are you?', 'iv4', 'b1b1b1b1-b1b1-b1b1-b1b1-b1b1b1b1b1b1', '33333333-3333-3333-3333-333333333333', '2', true),
  
  -- Group chat
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', 'Welcome to the team chat!', 'iv5', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '22222222-2222-2222-2222-222222222222', '2', true),
  ('e6e6e6e6-e6e6-e6e6-e6e6-e6e6e6e6e6e6', 'Thanks for adding me!', 'iv6', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '11111111-1111-1111-1111-111111111111', '2', true),
  ('e7e7e7e7-e7e7-e7e7-e7e7-e7e7e7e7e7e7', 'Great to be here!', 'iv7', 'c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', '33333333-3333-3333-3333-333333333333', '2', true);

-- Update users' contacts array
UPDATE users 
SET contacts = ARRAY['22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333']::text[]
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE users 
SET contacts = ARRAY['11111111-1111-1111-1111-111111111111']::text[]
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE users 
SET contacts = ARRAY['11111111-1111-1111-1111-111111111111']::text[]
WHERE id = '33333333-3333-3333-3333-333333333333';

