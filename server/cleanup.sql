-- Start a transaction for the data cleanup
BEGIN;

-- Disable triggers temporarily to avoid trigger-related issues during cleanup
SET session_replication_role = 'replica';

-- Truncate all tables in the correct order to handle foreign key constraints
TRUNCATE TABLE 
    chats,
    group_members,
    contacts,
    channels,
    sessions,
    secrets,
    oauths,
    users,
    migrations,
    search_meta
CASCADE;

-- Reset all sequences
ALTER SEQUENCE IF EXISTS migrations_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS search_meta_id_seq RESTART WITH 1;

-- Re-enable triggers
SET session_replication_role = 'origin';

COMMIT;