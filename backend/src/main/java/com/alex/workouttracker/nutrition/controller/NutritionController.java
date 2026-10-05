package com.alex.workouttracker.nutrition.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.alex.workouttracker.nutrition.dto.NutritionEntryRequest;
import com.alex.workouttracker.nutrition.dto.NutritionEntryResponse;
import com.alex.workouttracker.nutrition.service.NutritionService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/nutrition")
public class NutritionController {
   private final NutritionService nutritionService;

   @GetMapping("/{date}")
   public NutritionEntryResponse getNutritionEntry(@PathVariable LocalDate date) {
      return nutritionService.getNutritionEntry(date);
   }

   @PutMapping("/{date}")
   public NutritionEntryResponse saveNutritionEntry(
         @PathVariable LocalDate date,
         @Valid @RequestBody NutritionEntryRequest request) {
      return nutritionService.saveNutritionEntry(date, request);
   }

   @DeleteMapping("/{date}")
   public void deleteNutritionEntry(
         @PathVariable LocalDate date) {
      nutritionService.deleteNutritionEntry(date);
   }

   @GetMapping
   public List<NutritionEntryResponse> getNutritionEntryHistory(
         @RequestParam(required = false) LocalDate from,
         @RequestParam(required = false) LocalDate to) {
      return nutritionService.getNutritionHistory(from, to);
   }
}
