package com.alex.workouttracker.bodylog.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.alex.workouttracker.bodylog.dto.MeasurementEntryRequest;
import com.alex.workouttracker.bodylog.dto.MeasurementEntryResponse;
import com.alex.workouttracker.bodylog.service.MeasurementService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/measurements")
@RequiredArgsConstructor
public class MeasurementController {

   private final MeasurementService measurementService;

   @GetMapping("/{date}")
   public MeasurementEntryResponse getMeasurement(@PathVariable LocalDate date) {
      return measurementService.getMeasurement(date);
   }

   @GetMapping
   public List<MeasurementEntryResponse> getAllMeasurements() {
      return measurementService.getAllMeasurementEntries();
   }

   @PutMapping("/{date}")
   public MeasurementEntryResponse saveMeasurement(
         @PathVariable LocalDate date,
         @Valid @RequestBody MeasurementEntryRequest request) {
      return measurementService.saveMeasurement(date, request);
   }
}
