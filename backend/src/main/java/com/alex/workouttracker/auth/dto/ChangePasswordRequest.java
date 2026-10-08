package com.alex.workouttracker.auth.dto;

import jakarta.validation.constraints.Size;

public record ChangePasswordRequest(
    String currentPassword, @Size(min = 8, max = 100) String newPassword) {}
