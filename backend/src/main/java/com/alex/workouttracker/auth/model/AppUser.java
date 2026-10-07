package com.alex.workouttracker.auth.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "app_user",
    uniqueConstraints = {@UniqueConstraint(name = "uk_app_user_email", columnNames = "email")})
@Getter
@Setter
@NoArgsConstructor
public class AppUser {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private String email;

  @Column(name = "password_hash")
  private String passwordHash;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  public AppUser(String email, String passwordHash) {
    this.email = email;
    this.passwordHash = passwordHash;
    this.createdAt = Instant.now();
  }
}
