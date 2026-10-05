package com.alex.workouttracker.common;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException exception) {
    Map<String, String> fieldErrors = new LinkedHashMap<>();

    exception
        .getBindingResult()
        .getFieldErrors()
        .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

    ApiError response =
        new ApiError(HttpStatus.BAD_REQUEST.value(), "Validation failed", fieldErrors);

    return ResponseEntity.badRequest().body(response);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException exception) {
    ApiError response =
        new ApiError(HttpStatus.BAD_REQUEST.value(), exception.getMessage(), Map.of());

    return ResponseEntity.badRequest().body(response);
  }

  public record ApiError(int status, String message, Map<String, String> fieldErrors) {}
}
