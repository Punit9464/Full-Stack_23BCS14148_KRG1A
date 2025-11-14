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
public class AnalyzeCodeRequest {

    @NotBlank(message = "Code cannot be empty")
    private String code;

    private String language; // e.g., "javascript", "java", "python"
}