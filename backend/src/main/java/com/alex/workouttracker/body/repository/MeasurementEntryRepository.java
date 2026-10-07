package com.alex.workouttracker.body.repository;

import com.alex.workouttracker.body.model.MeasurementEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MeasurementEntryRepository extends JpaRepository<MeasurementEntry, UUID> {
  Optional<MeasurementEntry> findByUserIdAndDate(UUID userId, LocalDate date);

  List<MeasurementEntry> findAllByUserIdAndDateBetweenOrderByDateAsc(
      UUID userId, LocalDate from, LocalDate to);

  void deleteByUserIdAndDate(UUID userId, LocalDate date);

  List<MeasurementEntry> findAllByUserIdOrderByDateAsc(UUID userId);

  @Query(
      """
      select e.date
      from MeasurementEntry e
      where e.user.id = :userId
      order by e.date asc
      """)
  List<LocalDate> findAllDatesByUserId(@Param("userId") UUID userId);

  void deleteAllByUserId(UUID userId);
}
