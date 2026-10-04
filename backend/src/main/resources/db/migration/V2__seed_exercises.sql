INSERT INTO exercise (name)
VALUES
    ('Ring Rows'),
    ('Scapular Push-ups'),
    ('Biceps Curls'),
    ('Band External Rotation'),
    ('Crunches')
ON CONFLICT (name) DO NOTHING;