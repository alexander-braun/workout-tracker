package com.alex.workouttracker.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;

public record CurrentUserResponse(
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) UUID id,
    @Schema(requiredMode = Schema.RequiredMode.REQUIRED) String email) {}
