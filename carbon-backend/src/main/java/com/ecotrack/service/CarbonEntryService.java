package com.ecotrack.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ecotrack.dto.CarbonSummaryDTO;
import com.ecotrack.entity.CarbonEntry;
import com.ecotrack.entity.User;
import com.ecotrack.repository.CarbonEntryRepository;

@Service
public class CarbonEntryService {

    @Autowired
    private CarbonEntryRepository carbonEntryRepository;

    // Carbon emission factors
    private BigDecimal getEmissionFactor(String category) {

        if (category == null || category.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Carbon category is required");
        }

        switch (category.trim().toLowerCase()) {

            case "transportation":
            case "transport":
                return new BigDecimal("0.21");

            case "electricity":
                return new BigDecimal("0.82");

            case "fuel":
                return new BigDecimal("2.31");

            case "food":
                return new BigDecimal("1.80");

            case "waste":
                return new BigDecimal("0.57");

            case "water":
                return new BigDecimal("0.001");

            case "shopping":
                return new BigDecimal("0.42");

            case "travel":
                return new BigDecimal("0.19");

            default:
                throw new IllegalArgumentException(
                    "Invalid carbon category: " + category
                );
        }
    }

    // Save carbon entry and calculate emissions
    public CarbonEntry saveEntry(CarbonEntry entry, User user) {

        if (entry == null || entry.getQuantity() == null
                || entry.getQuantity().signum() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Quantity must be greater than zero");
        }

        entry.setUser(user);

        BigDecimal factor = getEmissionFactor(entry.getCategory());

        BigDecimal emissions = entry.getQuantity()
                .multiply(factor)
                .setScale(2, RoundingMode.HALF_UP);

        entry.setCarbonEmissionKg(emissions);

        return carbonEntryRepository.save(entry);
    }

    // Get all entries for logged-in user
    public List<CarbonEntry> getUserEntries(User user) {

        return carbonEntryRepository.findByUser(user);
    }

    public void deleteEntry(Long entryId, User user) {

        CarbonEntry entry = carbonEntryRepository.findById(entryId)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND,
                        "Carbon entry not found"));

        if (entry.getUser() == null
                || !entry.getUser().getUserId().equals(user.getUserId())) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN,
                    "You cannot delete another user's carbon entry");
        }

        carbonEntryRepository.delete(entry);
    }

    // Get carbon summary
    public CarbonSummaryDTO getCarbonSummary(User user) {

        List<CarbonEntry> entries = carbonEntryRepository.findByUser(user);

        BigDecimal total = BigDecimal.ZERO;
        BigDecimal transportation = BigDecimal.ZERO;
        BigDecimal electricity = BigDecimal.ZERO;
        BigDecimal food = BigDecimal.ZERO;
        BigDecimal water = BigDecimal.ZERO;
        BigDecimal waste = BigDecimal.ZERO;
        BigDecimal shopping = BigDecimal.ZERO;
        BigDecimal travel = BigDecimal.ZERO;

        for (CarbonEntry entry : entries) {

            BigDecimal emissions = entry.getCarbonEmissionKg();

            if (emissions == null) {
                continue;
            }

            total = total.add(emissions);

            String category = entry.getCategory();

            if (category == null) {
                continue;
            }

            switch (category.toLowerCase()) {

                case "transportation":
                case "transport":
                    transportation = transportation.add(emissions);
                    break;

                case "electricity":
                    electricity = electricity.add(emissions);
                    break;

                case "food":
                    food = food.add(emissions);
                    break;

                case "water":
                    water = water.add(emissions);
                    break;

                case "waste":
                    waste = waste.add(emissions);
                    break;

                case "shopping":
                    shopping = shopping.add(emissions);
                    break;

                case "travel":
                    travel = travel.add(emissions);
                    break;
            }
        }

        CarbonSummaryDTO summary = new CarbonSummaryDTO();

        summary.setTotalEmissions(total.doubleValue());
        summary.setTransportationEmissions(transportation.doubleValue());
        summary.setElectricityEmissions(electricity.doubleValue());
        summary.setFoodEmissions(food.doubleValue());
        summary.setWaterEmissions(water.doubleValue());
        summary.setWasteEmissions(waste.doubleValue());
        summary.setShoppingEmissions(shopping.doubleValue());
        summary.setTravelEmissions(travel.doubleValue());

        return summary;
    }
}
