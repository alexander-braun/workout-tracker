package com.alex.workouttracker.nutrition.controller;

import com.alex.workouttracker.nutrition.dto.NutritionDatesResponse;
import com.alex.workouttracker.nutrition.dto.NutritionEntryRequest;
import com.alex.workouttracker.nutrition.dto.NutritionEntryResponse;
import com.alex.workouttracker.nutrition.service.NutritionService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/nutrition")
public class NutritionController {
  private final NutritionService nutritionService;

  @GetMapping("/{date}")
  public NutritionEntryResponse getNutrition(@PathVariable LocalDate date) {
    return nutritionService.getNutritionEntry(date);
  }

  @PutMapping("/{date}")
  public NutritionEntryResponse saveNutrition(
      @PathVariable LocalDate date, @Valid @RequestBody NutritionEntryRequest request) {
    return nutritionService.saveNutritionEntry(date, request);
  }

  @DeleteMapping("/{date}")
  public void deleteNutrition(@PathVariable LocalDate date) {
    nutritionService.deleteNutritionEntry(date);
  }

  @GetMapping
  public List<NutritionEntryResponse> getNutritionHistory(
      @RequestParam(required = false) LocalDate from,
      @RequestParam(required = false) LocalDate to) {
    return nutritionService.getNutritionHistory(from, to);
  }

  @GetMapping("/dates")
  public NutritionDatesResponse getAllNutritionDates() {
    return new NutritionDatesResponse(nutritionService.getAllNutritionDates());
  }

  @DeleteMapping
  public void deleteAllNutritionEntries() {
    nutritionService.deleteAllNutritionEntries();
  }
}
