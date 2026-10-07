package com.alex.workouttracker.nutrition.repository;

import com.alex.workouttracker.nutrition.model.NutritionEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface NutritionEntryRepository extends JpaRepository<NutritionEntry, UUID> {
  Optional<NutritionEntry> findByUserIdAndDate(UUID userId, LocalDate date);

  List<NutritionEntry> findAllByUserIdAndDateBetweenOrderByDateAsc(
      UUID userId, LocalDate from, LocalDate to);

  void deleteByUserIdAndDate(UUID userId, LocalDate date);

  List<NutritionEntry> findAllByUserIdOrderByDateAsc(UUID userId);

  @Query(
      """
      select e.date
      from NutritionEntry e
      where e.user.id = :userId
      order by e.date asc
      """)
  List<LocalDate> findAllDatesByUserId(@Param("userId") UUID userId);

  void deleteAllByUserId(UUID userId);
}
