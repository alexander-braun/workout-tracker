package com.alex.workouttracker.bodylog.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.alex.workouttracker.bodylog.model.MeasurementEntry;

public interface MeasurementEntryRepository extends JpaRepository<MeasurementEntry, Long> {
   Optional<MeasurementEntry> findByDate(LocalDate date);

   List<MeasurementEntry> findAllByDateBetweenOrderByDateAsc(
         LocalDate from,
         LocalDate to);

   void deleteByDate(LocalDate date);

   List<MeasurementEntry> findAllByOrderByDateAsc();
}
