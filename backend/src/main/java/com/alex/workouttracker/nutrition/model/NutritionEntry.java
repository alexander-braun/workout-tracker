package com.alex.workouttracker.nutrition.model;

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
@Table(name = "nutrition_entry", uniqueConstraints = {
      @UniqueConstraint(name = "uk_nutrition_date", columnNames = { "nutrition_date" })
})
@Getter
@Setter
@NoArgsConstructor
public class NutritionEntry {
   public NutritionEntry(LocalDate date) {
      this.date = date;
   }

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Long id;

   @Column(nullable = false, name = "nutrition_date")
   private LocalDate date;

   @Column(precision = 7, scale = 2)
   private BigDecimal calories;

   @Column(precision = 5, scale = 2)
   private BigDecimal protein;

   @Column(name = "sleep_hours", precision = 4, scale = 2)
   private BigDecimal sleepHours;

   private Integer steps;

   @Column(name = "sleep_quality")
   private Integer sleepQuality;

   private Integer energy;

   @Column(length = 1000)
   private String notes;
}
