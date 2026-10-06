package com.alex.workouttracker.body.service;

import com.alex.workouttracker.body.dto.MeasurementEntryRequest;
import com.alex.workouttracker.body.dto.MeasurementEntryResponse;
import com.alex.workouttracker.body.model.MeasurementEntry;
import com.alex.workouttracker.body.repository.MeasurementEntryRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class MeasurementService {
  private final MeasurementEntryRepository measurementEntryRepository;

  @Transactional(readOnly = true)
  public List<MeasurementEntryResponse> getMeasurementHistory(LocalDate from, LocalDate to) {
    List<MeasurementEntry> measurementEntries;

    if (from == null || to == null) {
      measurementEntries = measurementEntryRepository.findAllByOrderByDateAsc();
    } else {
      measurementEntries = measurementEntryRepository.findAllByDateBetweenOrderByDateAsc(from, to);
    }

    return measurementEntries.stream().map(this::toResponse).toList();
  }

  @Transactional
  public void deleteMeasurement(LocalDate date) {
    measurementEntryRepository.deleteByDate(date);
  }

  @Transactional(readOnly = true)
  public MeasurementEntryResponse getMeasurement(LocalDate date) {
    MeasurementEntry measurement =
        measurementEntryRepository
            .findByDate(date)
            .orElseThrow(
                () ->
                    new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No measurement found for " + date));

    return toResponse(measurement);
  }

  @Transactional
  public MeasurementEntryResponse saveMeasurement(LocalDate date, MeasurementEntryRequest request) {
    MeasurementEntry measurement =
        measurementEntryRepository.findByDate(date).orElseGet(() -> new MeasurementEntry(date));

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

  @Transactional(readOnly = true)
  public List<LocalDate> getAllMeasurementDates() {
    return measurementEntryRepository.getAllMeasurementDates();
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
