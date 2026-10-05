package com.alex.workouttracker.body.controller;

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

import com.alex.workouttracker.body.dto.MeasurementEntryRequest;
import com.alex.workouttracker.body.dto.MeasurementEntryResponse;
import com.alex.workouttracker.body.service.MeasurementService;

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

   @PutMapping("/{date}")
   public MeasurementEntryResponse saveMeasurement(
         @PathVariable LocalDate date,
         @Valid @RequestBody MeasurementEntryRequest request) {
      return measurementService.saveMeasurement(date, request);
   }

   @DeleteMapping("/{date}")
   public void deleteMeasurement(@PathVariable LocalDate date) {
      measurementService.deleteMeasurement(date);
   }

   @GetMapping
   public List<MeasurementEntryResponse> getMeasurementHistory(
         @RequestParam(required = false) LocalDate from,
         @RequestParam(required = false) LocalDate to) {
      return measurementService.getMeasurementHistory(from, to);
   }
}
