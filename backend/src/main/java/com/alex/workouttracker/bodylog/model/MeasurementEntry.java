package com.alex.workouttracker.bodylog.model;

import java.math.BigDecimal;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "measurement_entry", uniqueConstraints = {
      @UniqueConstraint(name = "uk_measurement_date", columnNames = { "measurement_date" })
})
@Getter
@Setter
@NoArgsConstructor
public class MeasurementEntry {

   public MeasurementEntry(LocalDate date) {
      this.date = date;
   }

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

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
