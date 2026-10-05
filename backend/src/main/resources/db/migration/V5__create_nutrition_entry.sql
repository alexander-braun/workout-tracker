CREATE TABLE nutrition_entry (
    id BIGSERIAL PRIMARY KEY,
    nutrition_date DATE NOT NULL,

    calories NUMERIC(7, 2),
    protein NUMERIC(5, 2),
    sleep_hours NUMERIC(4, 2),

    steps INTEGER,
    sleep_quality INTEGER,
    energy INTEGER,

    notes VARCHAR(1000),

    CONSTRAINT uk_nutrition_date UNIQUE (nutrition_date)
);