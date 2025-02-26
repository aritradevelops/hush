-- RUN THIS AFTER STARTING THE SERVER --

-- SETUP ACCOUNT --
INSERT INTO "accounts" (
    "id", "name", "logo", "domain", "domain_verified",
    "created_by", "status", "created_at", "updated_at", "deleted_at",
    "updated_by", "deleted_by", "search", "slug"
) 
VALUES (
    '0b32d7d5-9777-4562-aadf-a1c1adf23f2e', 
    'Test Account', 
    'https://en.wikipedia.org/wiki/Google_logo#/media/File:Google_2015_logo.svg', 
    'accounts.docker.localhost', 
    true, 
    '1b306117-68ad-4e67-ae3c-538bc3aaa485',
    DEFAULT, DEFAULT, DEFAULT, DEFAULT, 
    DEFAULT, DEFAULT, DEFAULT, DEFAULT
);

-- SETUP APP --
INSERT INTO "apps" ( 
    "id", "name", "description", "landing_url", "logo",
    "branding", "auth_methods", "allow_mfa", "client_id", "client_secret",
    "redirect_uris", "jwt_secret", "signup_type", "jwt_algo", "jwt_lifetime",
    "refresh_token_lifetime", "permanent_callback", "permanent_error_callback", "acc_id", "created_by",
    "status", "created_at", "updated_at", "deleted_at", "updated_by",
    "deleted_by", "search"
) VALUES (
    '0b32d7d5-9777-4562-aadf-a1c1adf23f2e',
    'Start Up Ventures',
    'Lorem ipsum dolor sit amet consectetur adipisicing elit. 
     Facilis sint magni doloribus amet consequatur ratione nostrum saepe! 
     Quibusdam ex autem numquam ad nam omnis veniam porro. 
     Veritatis ducimus dolore nam?',
    'app.test.local',
    'https://en.wikipedia.org/wiki/Google_logo#/media/File:Google_2015_logo.svg',
    'branding.app.test.local',
    ARRAY['password'],
    true, 
    'client_id',
    'client_secret',
    ARRAY['https://localhost:3000/callback'],
    'super_jwt_secret',
    DEFAULT,
    DEFAULT,
    '1d',
    '30d',
    'https://localhost:3000/callback',
    'https://localhost:3000/error',
    '0b32d7d5-9777-4562-aadf-a1c1adf23f2e',
    '1b306117-68ad-4e67-ae3c-538bc3aaa485',
    DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT,
    DEFAULT, DEFAULT
);
-- SETUP ROLE --
INSERT INTO roles (
  "id", "name", "description", "org_id", "permissions",
  "acc_id", "created_by","status", "created_at", "updated_at", 
  "deleted_at", "updated_by", "deleted_by", "search"
) VALUES (
  'b51ad8a0-d1ab-4d5f-b363-1fba7e2a3c42', 'sass admin',
  'contains all permissions for sass admin',
  NULL, 
  -- TODO --
  ARRAY['to_be_decided'],
  '0b32d7d5-9777-4562-aadf-a1c1adf23f2e',
  '1b306117-68ad-4e67-ae3c-538bc3aaa485',
  DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT, DEFAULT
);

-- SETUP ROOT USER / SASS ADMIN --

INSERT INTO users (
  "id",
  "name",
  "email",
  "dp",
  "password",
  "password_updated_at",
  "email_verification_hash",
  "reset_password_hash",
  "acc_id","role_ids", "created_by","status", "created_at", "updated_at", 
  "deleted_at", "updated_by", "deleted_by", "search"
) VALUES (
  '1b306117-68ad-4e67-ae3c-538bc3aaa485',
  'Sass Admin',
  'admin@authinfinity.com',
  NULL,
  '$2a$12$7FqLSy/DEwO6A5qtA7M7negUsR/5ZxlTQtSK/EEDYBpc5/.X6rxdy', -- Test@1234
  now(),
  NULL,
  NULL,
  '0b32d7d5-9777-4562-aadf-a1c1adf23f2e',
  ARRAY['b51ad8a0-d1ab-4d5f-b363-1fba7e2a3c42']::uuid[],
  '1b306117-68ad-4e67-ae3c-538bc3aaa485',
  DEFAULT, DEFAULT, DEFAULT, DEFAULT,
  DEFAULT, DEFAULT, DEFAULT
);