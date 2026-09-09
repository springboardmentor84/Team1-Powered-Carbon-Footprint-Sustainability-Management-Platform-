package com.ecotrack.ai;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecotrack.dto.CarbonSummaryDTO;
import com.ecotrack.entity.GoalEntity;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;

@Service
public class AIRecommendationService {

    private Client client;

    public AIRecommendationService() {
        try {
            this.client = new Client();
        } catch (Exception e) {
            System.out.println(
                "Gemini client could not be initialized " +
                "(no API key configured). " +
                "Fallback recommendations will be used. " +
                "Error: " + e.getMessage()
            );
            this.client = null;
        }
    }

    public String generateRecommendation(
            CarbonSummaryDTO summary,
            List<GoalEntity> goals) {

        if (summary == null) {
            return "No carbon data available.";
        }

        StringBuilder goalContext = new StringBuilder();

        if (goals != null && !goals.isEmpty()) {

            for (GoalEntity goal : goals) {

                goalContext.append(
                        "- Goal: ").append(goal.getGoalName())
                        .append(", Target: ").append(goal.getTargetValue())
                        .append(", Current: ").append(goal.getCurrentValue())
                        .append(", Status: ").append(goal.getStatus())
                        .append("\n");
            }

        } else {

            goalContext.append(
                    "No active sustainability goals available.");
        }

        String prompt = """
                You are an environmental sustainability recommendation assistant.

                Analyze the user's carbon footprint and sustainability goals.

                CARBON DATA:
                Total emissions: %.2f kg CO2e
                Transportation: %.2f kg CO2e
                Electricity: %.2f kg CO2e
                Food: %.2f kg CO2e
                Water: %.2f kg CO2e
                Waste: %.2f kg CO2e
                Shopping: %.2f kg CO2e
                Travel: %.2f kg CO2e

                SUSTAINABILITY GOALS:
                %s

                Generate 3 personalized and practical recommendations based on the user's carbon footprint and sustainability goals.

                Write the recommendations as normal plain text.

                Do not use Markdown.
                Do not use asterisks.
                Do not use headings such as "Action:", "Reason:", or "Expected environmental benefit:".
                Do not use bullet symbols.

                Explain each recommendation naturally in 2-3 sentences.

                Also identify the user's highest-impact emission category.

                Keep the response concise, clear, and practical.
                """.formatted(
                summary.getTotalEmissions(),
                summary.getTransportationEmissions(),
                summary.getElectricityEmissions(),
                summary.getFoodEmissions(),
                summary.getWaterEmissions(),
                summary.getWasteEmissions(),
                summary.getShoppingEmissions(),
                summary.getTravelEmissions(),
                goalContext
        );

        try {

            if (client == null) {
                return fallbackRecommendation(summary);
            }

            GenerateContentResponse response =
                    client.models.generateContent(
                            "gemini-2.5-flash",
                            prompt,
                            null
                    );

            String result = response.text();

            if (result == null || result.isBlank()) {
                return fallbackRecommendation(summary);
            }

            return result;

        } catch (Exception e) {

            System.out.println(
                    "Gemini request failed: " + e.getMessage()
            );

            return fallbackRecommendation(summary);
        }
    }

    private String fallbackRecommendation(
            CarbonSummaryDTO summary) {

        double highestEmission =
                summary.getTransportationEmissions();

        String highestCategory = "Transportation";

        if (summary.getElectricityEmissions() > highestEmission) {
            highestEmission =
                    summary.getElectricityEmissions();
            highestCategory = "Electricity";
        }

        if (summary.getFoodEmissions() > highestEmission) {
            highestEmission =
                    summary.getFoodEmissions();
            highestCategory = "Food";
        }

        if (summary.getWaterEmissions() > highestEmission) {
            highestEmission =
                    summary.getWaterEmissions();
            highestCategory = "Water";
        }

        if (summary.getWasteEmissions() > highestEmission) {
            highestEmission =
                    summary.getWasteEmissions();
            highestCategory = "Waste";
        }

        if (summary.getShoppingEmissions() > highestEmission) {
            highestEmission =
                    summary.getShoppingEmissions();
            highestCategory = "Shopping";
        }

        if (summary.getTravelEmissions() > highestEmission) {
            highestEmission =
                    summary.getTravelEmissions();
            highestCategory = "Travel";
        }

        return """
                AI service is currently unavailable.

                Your highest emission category is %s with %.2f kg CO2e.

                Try reducing activities in this category and monitor your carbon footprint regularly.
                """.formatted(
                highestCategory,
                highestEmission
        );
    }
}