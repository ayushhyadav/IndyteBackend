export const lbsToKg = (lbs) => {
  if (typeof pounds !== "number") {
    throw new Error("Input must be a number");
  }
  const kilograms = pounds * 0.453592;
  return kilograms.toFixed(2);
};

export const getBMI = (weight, height) => {
  if (
    typeof weight !== "number" ||
    weight <= 0 ||
    typeof height !== "number" ||
    height <= 0
  ) {
    throw new Error("Weight and height must be positive numbers");
  }

  const bmi = weight / (height * height);

  return bmi.toFixed(2);
};

export const convertFtToCm = (feet) => {
  if (typeof feet !== "number" || feet <= 0) {
    throw new Error("Feet must be a positive number");
  }

  // Conversion factors
  const cmPerInch = 2.54;

  // Calculate total height in inches
  const totalInches = feet * 12;

  // Convert to centimeters
  const heightCm = totalInches * cmPerInch;

  return heightCm.toFixed(2);
};
