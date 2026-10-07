package com.alex.workouttracker.body.service;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.CurrentUserService;
import com.alex.workouttracker.body.dto.MeasurementEntryRequest;
import com.alex.workouttracker.body.dto.MeasurementEntryResponse;
import com.alex.workouttracker.body.model.MeasurementEntry;
import com.alex.workouttracker.body.repository.MeasurementEntryRepository;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MeasurementService {
  private final MeasurementEntryRepository measurementEntryRepository;
  private final CurrentUserService currentUserService;

  @Transactional(readOnly = true)
  public List<MeasurementEntryResponse> getMeasurementHistory(LocalDate from, LocalDate to) {
    List<MeasurementEntry> measurementEntries;
    AppUser user = currentUserService.getUser();

    if (from == null || to == null) {
      measurementEntries = measurementEntryRepository.findAllByUserIdOrderByDateAsc(user.getId());
    } else {
      measurementEntries =
          measurementEntryRepository.findAllByUserIdAndDateBetweenOrderByDateAsc(
              user.getId(), from, to);
    }

    return measurementEntries.stream().map(this::toResponse).toList();
  }

  @Transactional
  public void deleteMeasurement(LocalDate date) {
    measurementEntryRepository.deleteByUserIdAndDate(currentUserService.getUser().getId(), date);
  }

  @Transactional
  public void deleteAllMeasurementsFromUser() {
    measurementEntryRepository.deleteAllByUserId(currentUserService.getUser().getId());
  }

  @Transactional(readOnly = true)
  public MeasurementEntryResponse getMeasurement(LocalDate date) {
    return measurementEntryRepository
        .findByUserIdAndDate(currentUserService.getUser().getId(), date)
        .map(this::toResponse)
        .orElseGet(() -> MeasurementEntryResponse.empty(date));
  }

  @Transactional
  public MeasurementEntryResponse saveMeasurement(LocalDate date, MeasurementEntryRequest request) {
    AppUser user = currentUserService.getUser();
    MeasurementEntry measurement =
        measurementEntryRepository
            .findByUserIdAndDate(user.getId(), date)
            .orElseGet(() -> new MeasurementEntry(user, date));

    measurement.setChest(request.chest());
    measurement.setWaist(request.waist());
    measurement.setNeck(request.neck());
    measurement.setBicepsLeft(request.bicepsLeft());
    measurement.setBicepsRight(request.bicepsRight());
    measurement.setThighLeft(request.thighLeft());
    measurement.setThighRight(request.thighRight());
    measurement.setCalfLeft(request.calfLeft());
    measurement.setCalfRight(request.calfRight());
    measurement.setWeight(request.weight());

    MeasurementEntry measurementEntry = measurementEntryRepository.save(measurement);
    return toResponse(measurementEntry);
  }

  @Transactional(readOnly = true)
  public List<LocalDate> getAllMeasurementDates() {
    return measurementEntryRepository.findAllDatesByUserId(currentUserService.getUser().getId());
  }

  private MeasurementEntryResponse toResponse(MeasurementEntry entry) {
    return new MeasurementEntryResponse(
        entry.getId(),
        entry.getDate(),
        entry.getWeight(),
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
