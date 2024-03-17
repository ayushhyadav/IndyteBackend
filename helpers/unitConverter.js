export const lbsToKg = (lbs) => {
  const kilograms = parseFloat(lbs) * 0.453592;
  return kilograms.toFixed(2);
};

export const getBMI = (weight, height) => {
  const intHeight = parseFloat(height);
  const intWeight = parseFloat(weight);
  const bmi = intWeight / (intHeight * intHeight);
  return bmi.toFixed(2);
};

export const convertFtToCm = (feet) => {
  // Conversion factors
  const cmPerInch = 2.54;

  // Calculate total height in inches
  const totalInches = parseFloat(feet) * 12;

  // Convert to centimeters
  const heightCm = totalInches * cmPerInch;

  return heightCm.toFixed(2);
};
