package com.dsaanalyzer.dsaanalyzer.controller;

import com.dsaanalyzer.dsaanalyzer.model.AnalyzeCodeRequest;
import com.dsaanalyzer.dsaanalyzer.model.AnalyzeCodeResponse;
import com.dsaanalyzer.dsaanalyzer.model.DebugCodeRequest;
import com.dsaanalyzer.dsaanalyzer.model.DebugCodeResponse;
import com.dsaanalyzer.dsaanalyzer.service.CodeAnalyzerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class CodeAnalyzerController {

    private final CodeAnalyzerService codeAnalyzerService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeCode(@Valid @RequestBody AnalyzeCodeRequest request) {
        try {
            log.info("Received code analysis request for language: {}", request.getLanguage());
            AnalyzeCodeResponse response = codeAnalyzerService.analyzeCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error analyzing code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to analyze code: " + e.getMessage()));
        }
    }

    @PostMapping("/debug")
    public ResponseEntity<?> debugCode(@Valid @RequestBody DebugCodeRequest request) {
        try {
            log.info("Received code debug request for language: {}", request.getLanguage());
            DebugCodeResponse response = codeAnalyzerService.debugCode(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error debugging code: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Failed to debug code: " + e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "DSA Analyzer Backend");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("status", "failed");
        return error;
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        log.error("Unhandled exception: {}", e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("An unexpected error occurred"));
    }
}