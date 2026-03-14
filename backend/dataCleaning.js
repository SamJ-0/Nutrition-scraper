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
  checkLabels(arr);
}

function checkLabels(arr) {
  let labelsMapped = [];
  let foundLabelIndex = [];

  for (let i = 0; i < arr.length; i++) {
    let foundLabel = [];

    labels.forEach((word) => {
      if (arr[i].includes(word)) {
        foundLabelIndex.push(i);
        foundLabel.push(word);
      }
    });

    if (foundLabel.length > 0) {
      labelsMapped.push({
        index: i,
        foundLabelIndex: foundLabelIndex,
        type: foundLabel,
        row: arr[i],
      });
    }
  }
  identifyValues(labelsMapped);
}

function identifyValues(arr) {
  for (let i = 0; i < arr.length; i++) {
    const valuesUnits = arr[i].row.match(
      /(\d*\.?\d+)\s?(kcal|kj|g|%|grams|ml+)/gim,
    );

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
    arr[i].type = schemaLabels[i];
  }
  columnAssignment(arr);
}

function columnAssignment(arr) {
  let columnCount = 0;
  let refIntake;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].values.length > columnCount) {
      columnCount = arr[i].values.length;
    }

    if (columnCount > 0) {
      arr[i]["per100"] = 0;
    }

    if (arr[i].units.includes("%")) {
      arr[i]["refIntake"] = arr[i].units.indexOf("%");
      refIntake = arr[i].units.indexOf("%");
    }

    if (columnCount > refIntake) {
      arr[i]["perServing"] = columnCount - refIntake;
    }
  }
  convertKjToKcals(arr);
}

function convertKjToKcals(arr) {
  const kjPerKcal = 4.184;

  for (let i = 0; i < arr.length; i++) {
    const per100 = arr[i].per100;
    const perServing = arr[i].perServing;

    if (arr[i].units.includes("kj") && !arr[i].units.includes("kcal")) {
      const per100Kcals = Math.ceil(arr[i].values[per100] / kjPerKcal);
      const perServingKcals = Math.ceil(arr[i].values[perServing] / kjPerKcal);
      const kcalConversion = [per100Kcals, perServingKcals];

      arr[i]["kcalConversion"] = kcalConversion;
    }
  }
  console.log(arr);
}

export default processData;
