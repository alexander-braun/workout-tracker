package com.alex.workouttracker.nutrition.repository;

import com.alex.workouttracker.nutrition.model.NutritionEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, UUID> {
  Optional<NutritionEntry> findByDate(LocalDate date);

  List<NutritionEntry> findAllByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);

  void deleteByDate(LocalDate date);

  List<NutritionEntry> findAllByOrderByDateAsc();

  @Query("select e.date from NutritionEntry e order by e.date asc")
  List<LocalDate> getAllNutritionDates();
}
