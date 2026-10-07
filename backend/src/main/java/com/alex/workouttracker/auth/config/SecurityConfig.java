package com.alex.workouttracker.auth.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;

@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.authorizeHttpRequests(
            authorize ->
                authorize
                    .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/csrf")
                    .permitAll()
                    .anyRequest()
                    .authenticated())
        .formLogin(form -> form.disable())
        .httpBasic(basic -> basic.disable())
        .csrf(csrf -> csrf.spa())
        .logout(
            logout ->
                logout
                    .logoutUrl("/api/auth/logout")
                    .logoutSuccessHandler(
                        new HttpStatusReturningLogoutSuccessHandler(HttpStatus.NO_CONTENT)));
    return http.build();
  }

  @Bean
  PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration configuration)
      throws Exception {
    return configuration.getAuthenticationManager();
  }

  @Bean
  SecurityContextRepository securityContextRepository() {
    return new HttpSessionSecurityContextRepository();
  }
}
