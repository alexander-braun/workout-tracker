package com.alex.workouttracker.auth.dto;

import java.util.UUID;

public record CurrentUserResponse(UUID id, String email) {}
