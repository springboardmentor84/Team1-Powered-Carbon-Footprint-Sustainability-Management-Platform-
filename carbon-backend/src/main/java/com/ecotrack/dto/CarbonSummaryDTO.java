package com.ecotrack.dto;

public class CarbonSummaryDTO {

private double totalEmissions;
private double transportationEmissions;
private double electricityEmissions;
private double foodEmissions;
private double waterEmissions;
private double wasteEmissions;
private double shoppingEmissions;
private double travelEmissions;

public CarbonSummaryDTO() {
}

public double getTotalEmissions() {
    return totalEmissions;
}

public void setTotalEmissions(double totalEmissions) {
    this.totalEmissions = totalEmissions;
}

public double getTransportationEmissions() {
    return transportationEmissions;
}

public void setTransportationEmissions(double transportationEmissions) {
    this.transportationEmissions = transportationEmissions;
}

public double getElectricityEmissions() {
    return electricityEmissions;
}

public void setElectricityEmissions(double electricityEmissions) {
    this.electricityEmissions = electricityEmissions;
}

public double getFoodEmissions() {
    return foodEmissions;
}

public void setFoodEmissions(double foodEmissions) {
    this.foodEmissions = foodEmissions;
}

public double getWaterEmissions() {
    return waterEmissions;
}

public void setWaterEmissions(double waterEmissions) {
    this.waterEmissions = waterEmissions;
}

public double getWasteEmissions() {
    return wasteEmissions;
}

public void setWasteEmissions(double wasteEmissions) {
    this.wasteEmissions = wasteEmissions;
}

public double getShoppingEmissions() {
    return shoppingEmissions;
}

public void setShoppingEmissions(double shoppingEmissions) {
    this.shoppingEmissions = shoppingEmissions;
}

public double getTravelEmissions() {
    return travelEmissions;
}

public void setTravelEmissions(double travelEmissions) {
    this.travelEmissions = travelEmissions;
}

}