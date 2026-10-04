
package com.alex.workouttracker.workout.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum WeightUnit {
    KG("kg"),
    LBS("lbs"),
    BW("BW");

    private final String value;

    WeightUnit(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static WeightUnit fromValue(String value) {
        for (WeightUnit unit : values()) {
            if (unit.value.equalsIgnoreCase(value)) {
                return unit;
            }
        }

        throw new IllegalArgumentException("Unknown weight unit: " + value);
    }
}