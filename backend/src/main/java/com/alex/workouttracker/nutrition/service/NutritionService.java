package com.alex.workouttracker.nutrition.service;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.nutrition.dto.NutritionEntryRequest;
import com.alex.workouttracker.nutrition.dto.NutritionEntryResponse;
import com.alex.workouttracker.nutrition.model.NutritionEntry;
import com.alex.workouttracker.nutrition.repository.NutritionEntryRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NutritionService {
  private final NutritionEntryRepository nutritionEntryRepository;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public List<NutritionEntryResponse> getNutritionHistory(LocalDate from, LocalDate to) {
    List<NutritionEntry> nutritionEntries;
    AppUser user = currentUserService.getUser();
    if (from == null || to == null) {
      nutritionEntries = nutritionEntryRepository.findAllByUserIdOrderByDateAsc(user.getId());
    } else {
      nutritionEntries =
          nutritionEntryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(
              user.getId(), from, to);
    }

    return nutritionEntries.stream().map(this::toResponse).toList();
  }

  @Transactional
  public void deleteAllNutritionEntriesFromUser() {
    nutritionEntryRepository.deleteAllByUserId(currentUserService.getUser().getId());
  }

  @Transactional
  public void deleteNutritionEntry(LocalDate date) {
    nutritionEntryRepository.deleteByUserIdAndDate(currentUserService.getUser().getId(), date);
  }

  @Transactional(readOnly = true)
  public NutritionEntryResponse getNutritionEntry(LocalDate date) {
    return nutritionEntryRepository
        .findByUserIdAndDate(currentUserService.getUser().getId(), date)
        .map(this::toResponse)
        .orElseGet(() -> NutritionEntryResponse.empty(date));
  }

  @Transactional
  public NutritionEntryResponse saveNutritionEntry(LocalDate date, NutritionEntryRequest request) {
    AppUser user = currentUserService.getUser();
    NutritionEntry nutritionEntry =
        nutritionEntryRepository
            .findByUserIdAndDate(user.getId(), date)
            .orElseGet(() -> new NutritionEntry(user, date));
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

  @Transactional(readOnly = true)
  public List<LocalDate> getAllNutritionDates() {
    return nutritionEntryRepository.findAllDatesByUserId(currentUserService.getUser().getId());
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
