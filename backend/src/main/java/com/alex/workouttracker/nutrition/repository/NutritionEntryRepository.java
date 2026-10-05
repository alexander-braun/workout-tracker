package com.alex.workouttracker.nutrition.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alex.workouttracker.nutrition.model.NutritionEntry;

public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, Long> {
   Optional<NutritionEntry> findByDate(LocalDate date);

   List<NutritionEntry> findAllByDateBetweenOrderByDateAsc(
         LocalDate from,
         LocalDate to);

   void deleteByDate(LocalDate date);

   List<NutritionEntry> findAllByOrderByDateAsc();
}
