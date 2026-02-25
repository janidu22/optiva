-- ============================================================
-- Optiva Sample Data (dev only)
-- Password: "password123" hashed with BCrypt
-- ============================================================

-- Sample user (email: demo@optiva.app, password: password123)
INSERT INTO users (id, email, password, first_name, last_name)
VALUES ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'demo@optiva.app',
        '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjfdC1vOPvt3D9D2Gy5GU3xBd1V0O.',
        'Demo', 'User')
ON CONFLICT (email) DO NOTHING;

-- Sample profile
INSERT INTO user_profiles (id, user_id, age, height_cm, starting_weight_kg, target_weight_kg, timezone, gender)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        30, 175.0, 95.0, 80.0, 'Europe/London', 'MALE')
ON CONFLICT (user_id) DO NOTHING;

-- Sample program
INSERT INTO programs (id, user_id, start_date, notes)
VALUES ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        '2026-01-01', 'My 2026 transformation journey')
ON CONFLICT DO NOTHING;

-- Sample checkpoints
INSERT INTO checkpoints (id, program_id, checkpoint_date, title, status)
VALUES
    ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-04-01', '3-Month Checkpoint', 'UPCOMING'),
    ('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-07-01', '6-Month Checkpoint', 'UPCOMING'),
    ('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2027-01-01', '12-Month Checkpoint', 'UPCOMING')
ON CONFLICT DO NOTHING;

-- Sample weight entries
INSERT INTO weight_entries (id, user_id, entry_date, weight_kg)
VALUES
    ('e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-20', 93.5),
    ('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-21', 93.2),
    ('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-22', 92.8),
    ('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-23', 93.0),
    ('e4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-24', 92.6),
    ('e5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2026-02-25', 92.3)
ON CONFLICT (user_id, entry_date) DO NOTHING;

-- Sample habit
INSERT INTO habits (id, user_id, name, description, is_active)
VALUES ('f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'Drink 2L water', 'Stay hydrated throughout the day', true)
ON CONFLICT DO NOTHING;
