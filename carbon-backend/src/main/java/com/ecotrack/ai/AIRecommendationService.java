package com.ecotrack.ai;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ecotrack.dto.CarbonSummaryDTO;
import com.ecotrack.entity.GoalEntity;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.errors.RateLimitException;
import com.openai.models.responses.Response;
import com.openai.models.responses.ResponseCreateParams;

@Service
public class AIRecommendationService {

    private final OpenAIClient client;

    public AIRecommendationService() {
        this.client = OpenAIOkHttpClient.fromEnv();
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

            goalContext.append("No active sustainability goals available.");
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

                Generate 3 personalized recommendations.

                For each recommendation provide:
                1. Action
                2. Reason
                3. Expected environmental benefit

                Also identify the user's highest-impact emission category.

                Keep the response concise and practical.
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

            ResponseCreateParams params =
                    ResponseCreateParams.builder()
                            .model("gpt-5.6-luna")
                            .input(prompt)
                            .build();

            Response response = client.responses().create(params);

            return response.output().stream()
                    .flatMap(item -> item.message().stream())
                    .flatMap(message -> message.content().stream())
                    .flatMap(content -> content.outputText().stream())
                    .map(outputText -> outputText.text())
                    .findFirst()
                    .orElse(fallbackRecommendation(summary));

        } catch (RateLimitException e) {

            System.out.println(
                    "OpenAI quota unavailable. Using fallback recommendation."
            );

            return fallbackRecommendation(summary);

        } catch (Exception e) {

            System.out.println(
                    "OpenAI request failed: " + e.getMessage()
            );

            return fallbackRecommendation(summary);
        }
    }

    private String fallbackRecommendation(CarbonSummaryDTO summary) {

        double highestEmission =
                summary.getTransportationEmissions();

        String highestCategory = "Transportation";

        if (summary.getElectricityEmissions() > highestEmission) {
            highestEmission = summary.getElectricityEmissions();
            highestCategory = "Electricity";
        }

        if (summary.getFoodEmissions() > highestEmission) {
            highestEmission = summary.getFoodEmissions();
            highestCategory = "Food";
        }

        if (summary.getWaterEmissions() > highestEmission) {
            highestEmission = summary.getWaterEmissions();
            highestCategory = "Water";
        }

        if (summary.getWasteEmissions() > highestEmission) {
            highestEmission = summary.getWasteEmissions();
            highestCategory = "Waste";
        }

        if (summary.getShoppingEmissions() > highestEmission) {
            highestEmission = summary.getShoppingEmissions();
            highestCategory = "Shopping";
        }

        if (summary.getTravelEmissions() > highestEmission) {
            highestEmission = summary.getTravelEmissions();
            highestCategory = "Travel";
        }

        return """
                AI service is currently unavailable.

                Highest emission category:
                %s (%.2f kg CO2e)

                Recommendation:
                Reduce activities in this category and monitor your
                carbon footprint regularly.
                """.formatted(
                highestCategory,
                highestEmission
        );
    }
}