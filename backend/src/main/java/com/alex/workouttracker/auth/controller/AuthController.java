package com.alex.workouttracker.auth.controller;

import com.alex.workouttracker.auth.dto.ChangeEmailRequest;
import com.alex.workouttracker.auth.dto.ChangePasswordRequest;
import com.alex.workouttracker.auth.dto.CurrentUserResponse;
import com.alex.workouttracker.auth.dto.LoginRequest;
import com.alex.workouttracker.auth.dto.RegisterRequest;
import com.alex.workouttracker.auth.dto.RegisterResponse;
import com.alex.workouttracker.auth.exception.EmailAlreadyRegisteredException;
import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.service.AuthService;
import com.alex.workouttracker.auth.service.CurrentUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;
  private final SecurityContextRepository securityContextRepository;
  private final CurrentUserService currentUserService;

  @PostMapping("/register")
  public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
    AppUser user = authService.register(request);
    return new RegisterResponse(user.getId(), user.getEmail());
  }

  @PostMapping("/login")
  public ResponseEntity<Void> login(
      @Valid @RequestBody LoginRequest loginRequest,
      HttpServletRequest request,
      HttpServletResponse response) {
    Authentication authentication = authService.login(loginRequest);

    SecurityContext context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);

    SecurityContextHolder.setContext(context);
    securityContextRepository.saveContext(context, request, response);

    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(AuthenticationException.class)
  @ResponseStatus(HttpStatus.UNAUTHORIZED)
  void handleAuthenticationException() {}

  @ExceptionHandler(EmailAlreadyRegisteredException.class)
  @ResponseStatus(HttpStatus.CONFLICT)
  void handleEmailAlreadyRegistered() {}

  @GetMapping("/me")
  public ResponseEntity<CurrentUserResponse> getCurrentUser(Authentication authentication) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    AppUser user = currentUserService.getUser();
    return ResponseEntity.ok(
        new CurrentUserResponse(user.getId(), user.getEmail(), user.getCreatedAt()));
  }

  @DeleteMapping("me")
  public ResponseEntity<Void> deleteUser(HttpServletRequest request) {
    authService.deleteUser();
    HttpSession session = request.getSession(false);
    if (session != null) {
      session.invalidate();
    }
    SecurityContextHolder.clearContext();
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/password")
  public ResponseEntity<Void> updatePassword(@Valid @RequestBody ChangePasswordRequest request) {
    authService.updatePassword(request);
    return ResponseEntity.noContent().build();
  }

  @PutMapping("/email")
  public ResponseEntity<Void> updateEmail(@Valid @RequestBody ChangeEmailRequest request) {

    authService.updateEmail(request);
    return ResponseEntity.noContent().build();
  }

  @ExceptionHandler(BadCredentialsException.class)
  public ResponseEntity<String> handleBadCredentials(BadCredentialsException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
  }
}
