package com.alex.workouttracker.body.model;

import com.alex.workouttracker.auth.model.AppUser;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "measurement_entry",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uk_measurement_user_date",
          columnNames = {"user_id", "measurement_date"})
    })
@Getter
@Setter
@NoArgsConstructor
public class MeasurementEntry {

  public MeasurementEntry(AppUser user, LocalDate date) {
    this.date = date;
    this.user = user;
  }

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private AppUser user;

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, name = "measurement_date")
  private LocalDate date;

  @Column(precision = 5, scale = 2)
  private BigDecimal chest;

  @Column(precision = 5, scale = 2)
  private BigDecimal waist;

  @Column(precision = 5, scale = 2)
  private BigDecimal neck;

  @Column(precision = 5, scale = 2)
  private BigDecimal bicepsLeft;

  @Column(precision = 5, scale = 2)
  private BigDecimal bicepsRight;

  @Column(precision = 5, scale = 2)
  private BigDecimal thighLeft;

  @Column(precision = 5, scale = 2)
  private BigDecimal thighRight;

  @Column(precision = 5, scale = 2)
  private BigDecimal calfLeft;

  @Column(precision = 5, scale = 2)
  private BigDecimal calfRight;
}
