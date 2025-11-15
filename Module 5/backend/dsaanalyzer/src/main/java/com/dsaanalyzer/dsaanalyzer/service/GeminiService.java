package com.dsaanalyzer.dsaanalyzer.service;

import com.dsaanalyzer.dsaanalyzer.model.GeminiRequest;
import com.dsaanalyzer.dsaanalyzer.model.GeminiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final WebClient webClient;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public String generateContent(String prompt) {
        try {
            log.info("Calling Gemini API with prompt length: {}", prompt.length());

            GeminiRequest request = GeminiRequest.builder()
                    .contents(Collections.singletonList(
                            GeminiRequest.Content.builder()
                                    .parts(Collections.singletonList(
                                            GeminiRequest.Part.builder()
                                                    .text(prompt)
                                                    .build()
                                    ))
                                    .build()
                    ))
                    .build();

            GeminiResponse response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response != null &&
                    response.getCandidates() != null &&
                    !response.getCandidates().isEmpty() &&
                    response.getCandidates().get(0).getContent() != null &&
                    response.getCandidates().get(0).getContent().getParts() != null &&
                    !response.getCandidates().get(0).getContent().getParts().isEmpty()) {

                String generatedText = response.getCandidates().get(0)
                        .getContent()
                        .getParts()
                        .get(0)
                        .getText();

                log.info("Successfully received response from Gemini API");
                return generatedText;
            }

            log.warn("Empty response from Gemini API");
            return null;

        } catch (Exception e) {
            log.error("Error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate content from Gemini API", e);
        }
    }
}