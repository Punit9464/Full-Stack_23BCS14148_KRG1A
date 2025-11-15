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
public class AnalyzeCodeResponse {

    private String timeComplexity;

    private String spaceComplexity;

    private String pattern;

    private String summary;

    private List<String> intuition;

    private List<String> suggestions;

    private List<Integer> timeGraph;

    private List<Integer> spaceGraph;
}