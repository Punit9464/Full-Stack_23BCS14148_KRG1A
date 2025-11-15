package com.dsaanalyzer.dsaanalyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeIssue {

    private Integer line;

    private String type; // "error", "warning", "info"

    private String message;

    private String severity; // "high", "medium", "low"
}