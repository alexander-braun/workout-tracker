package com.alex.workouttracker.nutrition.dto;

import java.time.LocalDate;
import java.util.List;

public record NutritionDatesResponse(List<LocalDate> dates) {}
