package com.mobilerepair.dto;

import com.mobilerepair.entity.RepairStatus;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(@NotNull RepairStatus status) {}
