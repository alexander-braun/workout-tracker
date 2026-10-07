CREATE TABLE app_user (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL,

    CONSTRAINT uk_app_user_email
        UNIQUE (email)
);

CREATE TABLE exercise (
    exercise_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    user_id UUID NOT NULL,

    CONSTRAINT uk_exercise_user_name
        UNIQUE (user_id, name),
    
    CONSTRAINT fk_exercise_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
);

CREATE TABLE workout (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    workout_date DATE NOT NULL,
    user_id UUID NOT NULL,

    CONSTRAINT uk_workout_user_date
        UNIQUE (user_id, workout_date),

    CONSTRAINT fk_workout_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
);

CREATE TABLE workout_entry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

    workout_id UUID NOT NULL,
    exercise_id UUID NOT NULL,

    sets INTEGER NOT NULL,
    reps INTEGER NOT NULL,

    weight NUMERIC(8, 2),
    unit VARCHAR(10) NOT NULL,

    notes VARCHAR(1000),
    position INTEGER NOT NULL,

    CONSTRAINT fk_workout_entry_workout
        FOREIGN KEY (workout_id)
        REFERENCES workout(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_workout_entry_exercise
        FOREIGN KEY (exercise_id)
        REFERENCES exercise(exercise_id),

    CONSTRAINT uk_workout_entry_exercise
        UNIQUE (workout_id, exercise_id)
);

CREATE TABLE measurement_entry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    measurement_date DATE NOT NULL,
    user_id UUID NOT NULL,

    weight NUMERIC(5, 2),
    chest NUMERIC(5, 2),
    waist NUMERIC(5, 2),
    neck NUMERIC(5, 2),

    biceps_left NUMERIC(5, 2),
    biceps_right NUMERIC(5, 2),

    thigh_left NUMERIC(5, 2),
    thigh_right NUMERIC(5, 2),

    calf_left NUMERIC(5, 2),
    calf_right NUMERIC(5, 2),

    CONSTRAINT uk_measurement_user_date
        UNIQUE(user_id, measurement_date),

    CONSTRAINT fk_measurement_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
);

CREATE TABLE nutrition_entry (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nutrition_date DATE NOT NULL,
    user_id UUID NOT NULL,

    calories NUMERIC(7, 2),
    protein NUMERIC(5, 2),
    sleep_hours NUMERIC(4, 2),

    steps INTEGER,
    sleep_quality INTEGER,
    energy INTEGER,

    notes VARCHAR(1000),

    CONSTRAINT uk_nutrition_user_date
        UNIQUE (user_id, nutrition_date),
    
    CONSTRAINT fk_nutrition_user
        FOREIGN KEY (user_id)
        REFERENCES app_user(id)
);