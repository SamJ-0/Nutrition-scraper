import { labelDictionary } from "./dictionary.js";
const labels = [
  "energy",
  "fat",
  "saturates",
  "saturated",
  "carbohydrate",
  "sugars",
  "fibre",
  "fiber",
  "protein",
  "salt",
];

function processData(arr) {
  labelCheck(arr);
}

function labelCheck(arr) {
  let labelMapArr = [];

  for (let i = 0; i < arr.length; i++) {
    let foundLabel = [];
    labels.forEach((word) => {
      if (arr[i].includes(word)) {
        foundLabel.push(word);
      }
    });
    if (foundLabel.length > 0) {
      labelMapArr.push({ index: i, type: foundLabel, row: arr[i] });
    }
  }
  identifyValues(labelMapArr);
}

function identifyValues(arr) {
  let columnCount = 0;

  for (let i = 0; i < arr.length; i++) {
    const valuesUnits = arr[i].row.match(
      /(\d*\.?\d+)\s?(kcal|kj|g|%|grams|ml+)/gim,
    );

    if (valuesUnits.length > columnCount) {
      columnCount = valuesUnits.length;
    }

    const splitValuesUnits = valuesUnits.map((valuesUnits) =>
      valuesUnits.split(" "),
    );

    const parsedNums = splitValuesUnits.map((value) => parseFloat(value));
    arr[i]["values"] = parsedNums;

    const units = splitValuesUnits.map((unit) => unit[1]);
    arr[i]["units"] = units;
  }
  mapToSchemaLabel(arr);
}

function mapToSchemaLabel(arr) {
  let longestLabel;
  let schemaLabels = [];
  for (let i = 0; i < arr.length; i++) {
    const typeArr = arr[i].type;

    const sortedArr = typeArr.sort((a, b) => {
      return b.length - a.length;
    });

    longestLabel = sortedArr[0];

    const checkLabelDictionary = labelDictionary[longestLabel];
    schemaLabels.push(checkLabelDictionary);
  }
  // valueAssignment(arr);
  console.log(schemaLabels);
}

function valueAssignment(arr) {
  let count = 0;
  let per100;
  let perServing;
  let refIntake;
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].values.length > count) {
      count = arr[i].values.length;
    }
  }
  console.log(arr);
}

// function convertKjToKcals() {
//     const kjPerKcal = 4.184;
// }

export default processData;
