const labels = [
  "energy",
  "fat",
  "saturates",
  "carbohydrate",
  "sugars",
  "fibre",
  "protein",
  "salt",
];

function processData(arr) {
  labelCheck(arr);
}

function labelCheck(arr) {
  let labelMapArr = [];

  for (let i = 0; i < arr.length; i++) {
    labels.forEach((word) => {
      if (arr[i].includes(word)) {
        const rawData = {
          index: i,
          type: word,
          row: arr[i],
        };
        labelMapArr.push(rawData);
      }
    });
  }
  identifyUnits(labelMapArr);
}

function identifyUnits(arr) {
  const unitTokens = ["kcal", "kj", "g", "grams", "ml"];

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
  console.log(arr);
}

// function convertKjToKcals() {
//     const kjPerKcal = 4.184;
// }

export default processData;
