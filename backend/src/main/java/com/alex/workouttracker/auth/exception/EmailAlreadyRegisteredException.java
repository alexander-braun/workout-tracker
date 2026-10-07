package com.alex.workouttracker.auth.exception;

public class EmailAlreadyRegisteredException extends RuntimeException {

  public EmailAlreadyRegisteredException() {
    super("Email already registered");
  }
}
