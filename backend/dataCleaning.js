import { labelDictionary } from "./dictionary.js";

const cleanedData = {
  per100g: {
    energy: "",
    fat: "",
    satFat: "",
    carbohydrates: "",
    sugars: "",
    fibre: "",
    protein: "",
    salt: "",
  },
  perServing: {
    energy: "",
    fat: "",
    satFat: "",
    carbohydrates: "",
    sugars: "",
    fibre: "",
    protein: "",
    salt: "",
  },
  metaData: {
    servingSize: "",
    packWeight: "",
  },
};

function cleanData(rawObjectData) {
  for (const [key, value] of Object.entries(rawObjectData)) {
    console.log(`${key}: ${value}`);
  }
}

// function convertKjToKcals() {
//     const kjPerKcal = 4.184;
// }

export default cleanData;
