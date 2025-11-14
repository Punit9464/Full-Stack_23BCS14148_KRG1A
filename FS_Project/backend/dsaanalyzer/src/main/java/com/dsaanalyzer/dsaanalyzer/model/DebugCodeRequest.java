package com.dsaanalyzer.dsaanalyzer.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebugCodeRequest {

    @NotBlank(message = "Code cannot be empty")
    private String code;

    private String language;

    private String errorMessage; // Optional: user can provide error message
}