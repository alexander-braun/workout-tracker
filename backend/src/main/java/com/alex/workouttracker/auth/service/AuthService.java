package com.alex.workouttracker.auth.service;

import com.alex.workouttracker.auth.dto.ChangeEmailRequest;
import com.alex.workouttracker.auth.dto.ChangePasswordRequest;
import com.alex.workouttracker.auth.dto.LoginRequest;
import com.alex.workouttracker.auth.dto.RegisterRequest;
import com.alex.workouttracker.auth.exception.EmailAlreadyRegisteredException;
import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.repository.AppUserRepository;
import com.alex.workouttracker.body.service.MeasurementService;
import com.alex.workouttracker.nutrition.service.NutritionService;
import com.alex.workouttracker.workout.service.WorkoutService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final AppUserRepository appUserRepository;
  private final AuthenticationManager authenticationManager;
  private final PasswordEncoder passwordEncoder;
  private final CurrentUserService currentUserService;
  private final WorkoutService workoutService;
  private final NutritionService nutritionService;
  private final MeasurementService measurementService;

  public AppUser register(RegisterRequest request) {
    String email = request.email().trim().toLowerCase();
    if (appUserRepository.existsByEmailIgnoreCase(email)) {
      throw new EmailAlreadyRegisteredException();
    }

    String passwordHash = passwordEncoder.encode(request.password());
    return appUserRepository.save(new AppUser(email, passwordHash));
  }

  public Authentication login(LoginRequest request) {
    var authenticationToken =
        UsernamePasswordAuthenticationToken.unauthenticated(
            request.email().trim().toLowerCase(), request.password());
    Authentication auth = authenticationManager.authenticate(authenticationToken);
    AppUser user = getUserByEmail(auth.getName());
    return new UsernamePasswordAuthenticationToken(user.getId(), null, auth.getAuthorities());
  }

  public AppUser getUserByEmail(String email) {
    return appUserRepository
        .findByEmailIgnoreCase(email.trim().toLowerCase())
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
  }

  @Transactional
  public void updatePassword(ChangePasswordRequest request) {
    AppUser user = currentUserService.getUser();
    if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
      throw new BadCredentialsException("Current password is incorrect");
    }
    user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
  }

  @Transactional
  public void updateEmail(ChangeEmailRequest request) {
    AppUser user = currentUserService.getUser();
    String email = request.email().trim().toLowerCase();

    if (user.getEmail().equalsIgnoreCase(email)) {
      return;
    }

    if (appUserRepository.existsByEmailIgnoreCase(email)) {
      throw new EmailAlreadyRegisteredException();
    }

    user.setEmail(email);
  }

  @Transactional
  public void deleteUser() {
    AppUser user = currentUserService.getUser();
    measurementService.deleteAllMeasurementsFromUser();
    workoutService.deleteAllWorkoutsFromUser();
    nutritionService.deleteAllNutritionEntriesFromUser();
    appUserRepository.deleteById(user.getId());
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<String> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }
}
