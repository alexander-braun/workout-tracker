package com.alex.workouttracker.bodylog.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.alex.workouttracker.bodylog.dto.MeasurementEntryRequest;
import com.alex.workouttracker.bodylog.dto.MeasurementEntryResponse;
import com.alex.workouttracker.bodylog.model.MeasurementEntry;
import com.alex.workouttracker.bodylog.repository.MeasurementEntryRepository;

import jakarta.validation.Valid;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.server.ResponseStatusException;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MeasurementService {
   private final MeasurementEntryRepository measurementEntryRepository;

   @Transactional(readOnly = true)
   public List<MeasurementEntryResponse> getAllMeasurementEntries() {
      return measurementEntryRepository.findAllByOrderByDateAsc()
            .stream().map(this::toResponse).toList();
   }

   @Transactional(readOnly = true)
   public MeasurementEntryResponse getMeasurement(LocalDate date) {
      MeasurementEntry measurement = measurementEntryRepository
            .findByDate(date)
            .orElseThrow(() -> new ResponseStatusException(
                  HttpStatus.NOT_FOUND,
                  "No measurement found for " + date));

      return toResponse(measurement);
   }

   @Transactional
   public MeasurementEntryResponse saveMeasurement(
         LocalDate date,
         @Valid @RequestBody MeasurementEntryRequest request) {
      MeasurementEntry measurement = measurementEntryRepository
            .findByDate(date)
            .orElseGet(() -> new MeasurementEntry(date));

      measurement.setChest(request.chest());
      measurement.setWaist(request.waist());
      measurement.setNeck(request.neck());
      measurement.setBicepsLeft(request.bicepsLeft());
      measurement.setBicepsRight(request.bicepsRight());
      measurement.setThighLeft(request.thighLeft());
      measurement.setThighRight(request.thighRight());
      measurement.setCalfLeft(request.calfLeft());
      measurement.setCalfRight(request.calfRight());

      MeasurementEntry measurementEntry = measurementEntryRepository.save(measurement);
      return toResponse(measurementEntry);
   }

   private MeasurementEntryResponse toResponse(MeasurementEntry entry) {
      return new MeasurementEntryResponse(
            entry.getId(),
            entry.getDate(),
            entry.getChest(),
            entry.getWaist(),
            entry.getNeck(),
            entry.getBicepsLeft(),
            entry.getBicepsRight(),
            entry.getThighLeft(),
            entry.getThighRight(),
            entry.getCalfLeft(),
            entry.getCalfRight());
   }
}
