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
  identifyUnits(labelMapArr);
}

function identifyUnits(arr) {
  const unitTokens = ["kcal", "kj", "g", "grams", "ml", "%"];

  for (let i = 0; i < arr.length; i++) {
    unitTokens.forEach((unit) => {
      if (!arr[i]["unit"]) {
        arr[i]["unit"] = [];
      }

      if (arr[i].row.includes(unit)) {
        arr[i]["unit"].push(unit);
      }
    });
  }
  identifyNumbers(arr);
}

function identifyNumbers(arr) {
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i].row;
    const numbers = row.match(/\d+\.?\d*/g);
    const parsedNums = numbers.map((num) => parseFloat(num));

    arr[i]["values"] = parsedNums;
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
  // console.log(schemaLabels);
  valueAssignment(arr);
}

function valueAssignment(arr) {
  console.log(arr);
  for (let i = 0; i < arr.length; i++) {
    console.log(arr[i].values);
  }
}

// function convertKjToKcals() {
//     const kjPerKcal = 4.184;
// }

export default processData;
