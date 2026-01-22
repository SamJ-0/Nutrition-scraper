import { labelDictionary } from "./dictionary.js";
import cleanedData from "./cleanedData.js";

function mapToLabel(label, value, category) {
  const labelMapping = labelDictionary[label];
  filterUndefinedLabels(labelMapping, value, category);
}

function filterUndefinedLabels(label, value, category) {
  if (label != undefined) {
    cleanedProductData(label, value, category);
  }
}

function cleanedProductData(label, value, category) {
  cleanedData[category][label] = value;
}

// function convertKjToKcals() {
//     const kjPerKcal = 4.184;
// }

export default mapToLabel;
