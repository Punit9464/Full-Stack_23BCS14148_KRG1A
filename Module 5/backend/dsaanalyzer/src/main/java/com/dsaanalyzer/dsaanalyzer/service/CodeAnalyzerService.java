package com.dsaanalyzer.dsaanalyzer.service;

import com.dsaanalyzer.dsaanalyzer.model.AnalyzeCodeRequest;
import com.dsaanalyzer.dsaanalyzer.model.AnalyzeCodeResponse;
import com.dsaanalyzer.dsaanalyzer.model.CodeIssue;
import com.dsaanalyzer.dsaanalyzer.model.DebugCodeRequest;
import com.dsaanalyzer.dsaanalyzer.model.DebugCodeResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class CodeAnalyzerService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AnalyzeCodeResponse analyzeCode(AnalyzeCodeRequest request) {
        log.info("Starting code analysis for language: {}", request.getLanguage());

        String prompt = buildAnalysisPrompt(request);
        String geminiResponse = geminiService.generateContent(prompt);

        return parseAnalysisResponse(geminiResponse);
    }

    public DebugCodeResponse debugCode(DebugCodeRequest request) {
        log.info("Starting code debugging for language: {}", request.getLanguage());

        String prompt = buildDebugPrompt(request);
        String geminiResponse = geminiService.generateContent(prompt);

        return parseDebugResponse(geminiResponse, request.getCode());
    }

    private String buildAnalysisPrompt(AnalyzeCodeRequest request) {
        return String.format("""
                        You are an expert DSA Analyzer AI. Analyze the following %s code and provide a concise DSA analysis.
                        
                                    CODE:
                                    ```%s
                                    %s
                                    ```
                        
                                    REQUIREMENTS:
                                    1. timeComplexity: Big O time complexity
                                    2. spaceComplexity: Big O space complexity
                                    3. pattern: Main algorithmic pattern
                                    4. summary: 1–2 sentence description
                                    5. intuition: 4–6 key reasoning points
                                    6. suggestions: 3–5 specific optimization ideas
                        
                                    OUTPUT (JSON only, no markdown or extra text):
                                    {
                                      "timeComplexity": "O(n log n)",
                                      "spaceComplexity": "O(n)",
                                      "pattern": "Divide & Conquer",
                                      "summary": "Implements merge sort by dividing and merging arrays.",
                                      "intuition": [
                                        "Divide array recursively",
                                        "Merge halves efficiently",
                                        "Base case: single element",
                                        "Extra space for faster sorting"
                                      ],
                                      "suggestions": [
                                        "Use in-place Quick Sort for lower space use",
                                        "Validate input for null/empty arrays",
                                        "Implement iterative version to avoid recursion overhead"
                                      ]
                                    }
                        
                                    GUIDELINES:
                                    - Keep it accurate, concise, and code-specific
                                    - Focus on efficiency, optimization, and DSA principles
                                    - Mention only the dominant pattern
                                    - Avoid repetition or generic advice
                """,
                request.getLanguage() != null ? request.getLanguage() : "code",
                request.getLanguage() != null ? request.getLanguage() : "",
                request.getCode()
        );
    }

    private String buildDebugPrompt(DebugCodeRequest request) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("""
                You are an expert Code Debugger and Error Analysis AI. Your role is to identify bugs, errors, warnings, and potential issues in code, and provide actionable solutions.
                
                TASK: Debug and thoroughly analyze the following code for all issues.
                
                """);

        prompt.append(String.format("""
                CODE TO DEBUG:
                ```%s
                %s
                ```
                
                """,
                request.getLanguage() != null ? request.getLanguage() : "code",
                request.getCode()
        ));

        if (request.getErrorMessage() != null && !request.getErrorMessage().isEmpty()) {
            prompt.append(String.format("""
                    REPORTED ERROR:
                    %s
                    
                    """,
                    request.getErrorMessage()
            ));
        }

        prompt.append("""
                ANALYSIS REQUIREMENTS:
                1. Identify all issues:
                   - Syntax, runtime, logic, performance, and code quality problems
                2. Explain briefly what’s wrong and why
                3. Give 4–6 concise, actionable fixes
                
                OUTPUT FORMAT (JSON only, no markdown or extra text):
                {
                  "issues": [
                    {"line": 6, "type": "error", "message": "Function 'merge' not defined", "severity": "high"},
                    {"line": 2, "type": "warning", "message": "No null/undefined input check", "severity": "medium"}
                  ],
                  "explanation": "Code calls undefined 'merge' function causing runtime error; lacks input validation.",
                  "fixSuggestions": [
                    "Define 'merge' before use.",
                    "Validate input array for null or undefined.",
                    "Handle edge cases like empty arrays.",
                    "Use try-catch for safe error handling."
                  ]
                }
                
                GUIDELINES:
                - Use accurate line numbers.
                - Keep explanations under 3 sentences.
                - Use 'error' (high), 'warning' (medium), 'info' (low).
                - Avoid verbose or repetitive text.
                - Focus on clarity, correctness, and brevity.
                """);

        return prompt.toString();
    }

    private AnalyzeCodeResponse parseAnalysisResponse(String response) {
        try {
            // Extract JSON from response (in case there's extra text)
            String jsonStr = extractJson(response);
            JsonNode node = objectMapper.readTree(jsonStr);

            // Parse intuition array
            List<String> intuition = new ArrayList<>();
            if (node.has("intuition") && node.get("intuition").isArray()) {
                node.get("intuition").forEach(item -> intuition.add(item.asText()));
            }

            // Parse suggestions array
            List<String> suggestions = new ArrayList<>();
            if (node.has("suggestions") && node.get("suggestions").isArray()) {
                node.get("suggestions").forEach(item -> suggestions.add(item.asText()));
            }

            // Generate graph data based on complexity
            String timeComplexity = node.has("timeComplexity") ? node.get("timeComplexity").asText() : "O(n)";
            String spaceComplexity = node.has("spaceComplexity") ? node.get("spaceComplexity").asText() : "O(1)";

            return AnalyzeCodeResponse.builder()
                    .timeComplexity(timeComplexity)
                    .spaceComplexity(spaceComplexity)
                    .pattern(node.has("pattern") ? node.get("pattern").asText() : "Unknown")
                    .summary(node.has("summary") ? node.get("summary").asText() : "")
                    .intuition(intuition)
                    .suggestions(suggestions)
                    .timeGraph(generateGraphData(timeComplexity))
                    .spaceGraph(generateGraphData(spaceComplexity))
                    .build();

        } catch (Exception e) {
            log.error("Error parsing analysis response: {}", e.getMessage(), e);
            // Return a fallback response
            return createFallbackAnalysisResponse();
        }
    }

    private DebugCodeResponse parseDebugResponse(String response, String originalCode) {
        try {
            String jsonStr = extractJson(response);
            JsonNode node = objectMapper.readTree(jsonStr);

            // Parse issues array
            List<CodeIssue> issues = new ArrayList<>();
            if (node.has("issues") && node.get("issues").isArray()) {
                node.get("issues").forEach(item -> {
                    CodeIssue issue = CodeIssue.builder()
                            .line(item.has("line") ? item.get("line").asInt() : 0)
                            .type(item.has("type") ? item.get("type").asText() : "info")
                            .message(item.has("message") ? item.get("message").asText() : "")
                            .severity(item.has("severity") ? item.get("severity").asText() : "medium")
                            .build();
                    issues.add(issue);
                });
            }

            // Parse fix suggestions
            List<String> fixSuggestions = new ArrayList<>();
            if (node.has("fixSuggestions") && node.get("fixSuggestions").isArray()) {
                node.get("fixSuggestions").forEach(item -> fixSuggestions.add(item.asText()));
            }

            return DebugCodeResponse.builder()
                    .code(originalCode)
                    .issues(issues)
                    .explanation(node.has("explanation") ? node.get("explanation").asText() : "")
                    .fixSuggestions(fixSuggestions)
                    .build();

        } catch (Exception e) {
            log.error("Error parsing debug response: {}", e.getMessage(), e);
            return createFallbackDebugResponse(originalCode);
        }
    }

    private String extractJson(String response) {
        // Try to find JSON object in the response
        Pattern pattern = Pattern.compile("\\{[^{}]*(?:\\{[^{}]*\\}[^{}]*)*\\}", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(response);

        if (matcher.find()) {
            return matcher.group();
        }

        // If no JSON found, try to clean the response
        response = response.trim();
        if (response.startsWith("```json")) {
            response = response.substring(7);
        }
        if (response.startsWith("```")) {
            response = response.substring(3);
        }
        if (response.endsWith("```")) {
            response = response.substring(0, response.length() - 3);
        }

        return response.trim();
    }

    private List<Integer> generateGraphData(String complexity) {
        // Generate sample data points based on complexity
        // This simulates how the complexity grows with input size
        complexity = complexity.toUpperCase().trim();

        List<Integer> data = new ArrayList<>();
        int[] sizes = {10, 20, 40, 80, 160}; // Input sizes

        for (int n : sizes) {
            int value;
            if (complexity.contains("O(1)")) {
                value = 5; // Constant
            } else if (complexity.contains("O(LOG N)") || complexity.contains("O(LOGN)")) {
                value = (int) (Math.log(n) / Math.log(2)) * 5;
            } else if (complexity.contains("O(N LOG N)") || complexity.contains("O(NLOGN)")) {
                value = (int) (n * (Math.log(n) / Math.log(2)));
            } else if (complexity.contains("O(N²)") || complexity.contains("O(N^2)")) {
                value = n * n / 10;
            } else if (complexity.contains("O(N³)") || complexity.contains("O(N^3)")) {
                value = n * n * n / 100;
            } else if (complexity.contains("O(2^N)")) {
                value = (int) Math.pow(2, n / 10);
            } else { // Default O(n)
                value = n;
            }
            data.add(value);
        }

        return data;
    }

    private AnalyzeCodeResponse createFallbackAnalysisResponse() {
        return AnalyzeCodeResponse.builder()
                .timeComplexity("O(n)")
                .spaceComplexity("O(1)")
                .pattern("Unknown")
                .summary("Unable to analyze the code. Please try again.")
                .intuition(Arrays.asList(
                        "Review the problem statement carefully",
                        "Identify the core data structures needed",
                        "Consider edge cases"
                ))
                .suggestions(Arrays.asList(
                        "Ensure code is syntactically correct",
                        "Add comments for clarity"
                ))
                .timeGraph(Arrays.asList(10, 20, 40, 80, 160))
                .spaceGraph(Arrays.asList(5, 5, 5, 5, 5))
                .build();
    }

    private DebugCodeResponse createFallbackDebugResponse(String code) {
        return DebugCodeResponse.builder()
                .code(code)
                .issues(Arrays.asList(
                        CodeIssue.builder()
                                .line(0)
                                .type("info")
                                .message("Unable to analyze code. Please check syntax.")
                                .severity("low")
                                .build()
                ))
                .explanation("Unable to perform detailed debugging analysis.")
                .fixSuggestions(Arrays.asList(
                        "Verify code syntax",
                        "Check for common errors",
                        "Review documentation"
                ))
                .build();
    }
}