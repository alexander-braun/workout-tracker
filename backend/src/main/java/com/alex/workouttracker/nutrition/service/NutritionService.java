package com.alex.workouttracker.nutrition.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.alex.workouttracker.nutrition.dto.NutritionEntryRequest;
import com.alex.workouttracker.nutrition.dto.NutritionEntryResponse;
import com.alex.workouttracker.nutrition.model.NutritionEntry;
import com.alex.workouttracker.nutrition.repository.NutritionEntryRepository;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NutritionService {
   private final NutritionEntryRepository nutritionEntryRepository;

   @Transactional(readOnly = true)
   public List<NutritionEntryResponse> getNutritionHistory(
         LocalDate from,
         LocalDate to) {
      List<NutritionEntry> nutritionEntries;
      if (from == null || to == null) {
         nutritionEntries = nutritionEntryRepository.findAllByOrderByDateAsc();
      } else {
         nutritionEntries = nutritionEntryRepository.findAllByDateBetweenOrderByDateAsc(from, to);
      }

      return nutritionEntries.stream().map(this::toResponse).toList();
   }

   @Transactional
   public void deleteNutritionEntry(LocalDate date) {
      nutritionEntryRepository.deleteByDate(date);
   }

   @Transactional(readOnly = true)
   public NutritionEntryResponse getNutritionEntry(LocalDate date) {
      NutritionEntry nutritionEntry = nutritionEntryRepository.findByDate(date)
            .orElseThrow(() -> new ResponseStatusException(
                  HttpStatus.NOT_FOUND,
                  "No nutrition entry for " + date));
      return toResponse(nutritionEntry);
   }

   @Transactional
   public NutritionEntryResponse saveNutritionEntry(
         LocalDate date,
         NutritionEntryRequest request) {
      NutritionEntry nutritionEntry = nutritionEntryRepository.findByDate(date)
            .orElseGet(() -> new NutritionEntry(date));
      nutritionEntry.setCalories(request.calories());
      nutritionEntry.setProtein(request.protein());
      nutritionEntry.setSleepHours(request.sleepHours());
      nutritionEntry.setSteps(request.steps());
      nutritionEntry.setSleepQuality(request.sleepQuality());
      nutritionEntry.setEnergy(request.energy());
      nutritionEntry.setNotes(request.notes());

      NutritionEntry savedEntry = nutritionEntryRepository.save(nutritionEntry);
      return toResponse(savedEntry);
   }

   private NutritionEntryResponse toResponse(NutritionEntry entry) {
      return new NutritionEntryResponse(
            entry.getId(),
            entry.getDate(),
            entry.getCalories(),
            entry.getProtein(),
            entry.getSleepHours(),
            entry.getSteps(),
            entry.getSleepQuality(),
            entry.getEnergy(),
            entry.getNotes());
   }
}
