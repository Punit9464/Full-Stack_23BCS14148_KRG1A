package com.dsaanalyzer.dsaanalyzer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DebugCodeResponse {

    private String code;

    private List<CodeIssue> issues;

    private String explanation;

    private List<String> fixSuggestions;
}