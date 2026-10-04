CREATE TABLE measurement_entry (
    id BIGSERIAL PRIMARY KEY,
    measurement_date DATE NOT NULL,

    chest NUMERIC(5, 2),
    waist NUMERIC(5, 2),
    neck NUMERIC(5, 2),

    biceps_left NUMERIC(5, 2),
    biceps_right NUMERIC(5, 2),

    thigh_left NUMERIC(5, 2),
    thigh_right NUMERIC(5, 2),

    calf_left NUMERIC(5, 2),
    calf_right NUMERIC(5, 2),

    CONSTRAINT uk_measurement_date UNIQUE (measurement_date)
);