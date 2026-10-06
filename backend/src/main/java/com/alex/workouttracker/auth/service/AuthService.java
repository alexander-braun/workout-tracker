package com.alex.workouttracker.auth.service;

import com.alex.workouttracker.auth.dto.LoginRequest;
import com.alex.workouttracker.auth.dto.RegisterRequest;
import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
  private final AppUserRepository appUserRepository;
  private final AuthenticationManager authenticationManager;
  private final PasswordEncoder passwordEncoder;

  public AppUser register(RegisterRequest request) {
    String email = request.email().trim().toLowerCase();
    if (appUserRepository.existsByEmailIgnoreCase(email)) {
      throw new IllegalArgumentException("Email already registered");
    }

    String passwordHash = passwordEncoder.encode(request.password());

    return appUserRepository.save(new AppUser(email, passwordHash));
  }

  public Authentication login(LoginRequest request) {
    var authenticationToken =
        UsernamePasswordAuthenticationToken.unauthenticated(
            request.email().trim().toLowerCase(), request.password());
    return authenticationManager.authenticate(authenticationToken);
  }
}
