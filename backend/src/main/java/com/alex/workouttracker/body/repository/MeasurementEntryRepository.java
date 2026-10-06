package com.alex.workouttracker.body.repository;

import com.alex.workouttracker.body.model.MeasurementEntry;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MeasurementEntryRepository extends JpaRepository<MeasurementEntry, Long> {
  Optional<MeasurementEntry> findByDate(LocalDate date);

  List<MeasurementEntry> findAllByDateBetweenOrderByDateAsc(LocalDate from, LocalDate to);

  void deleteByDate(LocalDate date);

  List<MeasurementEntry> findAllByOrderByDateAsc();

  @Query("select e.date from MeasurementEntry e order by e.date asc")
  List<LocalDate> getAllMeasurementDates();
}
