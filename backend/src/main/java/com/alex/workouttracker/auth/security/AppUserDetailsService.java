package com.alex.workouttracker.auth.security;

import com.alex.workouttracker.auth.model.AppUser;
import com.alex.workouttracker.auth.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

  private final AppUserRepository appUserRepository;

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    AppUser user =
        appUserRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    if (user.getPasswordHash() == null) {
      throw new UsernameNotFoundException("Local password login not available");
    }

    return User.withUsername(user.getEmail())
        .password(user.getPasswordHash())
        .roles("USER")
        .build();
  }
}
