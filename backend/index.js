import axios from "axios";
import * as cheerio from "cheerio";
import { selectors as defaultSelectors } from "./selectors.js";
import mapToLabel from "./dataCleaning.js";

let selectors = defaultSelectors;

try {
  selectors = (await import("./selectors.local.js")).selectors;
} catch (err) {
  console.log("Using default selectors:", selectors);
}

async function nutritionScrape(productUrl) {
  try {
    const rawFoodData = [];
    // const rawFoodData = {
    //   tableHeader: [],
    //   name: "",
    //   per100g: {},
    //   perServing: {},
    //   referenceIntake: {},
    // };

    const indices = {
      typicalValues: "",
      per100: "",
      perServing: "",
      referenceIntake: "",
    };

    const { data: html } = await axios.get(productUrl);
    const $ = cheerio.load(html);

    const tableHeaderArr = [];

    $(selectors.heading + "th").each((i, head) => {
      const tableHeading = $(head).text().toLowerCase();
      tableHeaderArr.push(tableHeading);
    });

    // rawFoodData["tableHeader"] = tableHeaderArr;
    // getTableIndexes(rawFoodData.tableHeader, indices);

    const productName = $(selectors.productName).find("h1").text();
    // rawFoodData["name"] = productName;

    $(selectors.nutritionData + "tr").each((i, row) => {
      const nutritionTd = $(row).find("td");

      const nutritionRow = $(row).find("td").text().toLowerCase();
      console.log(nutritionRow);
      const initialLabel = $(nutritionTd[0]).text().toLowerCase();
      const valuesPer100g = $(nutritionTd[indices.per100]).text().toLowerCase();
      const valuesPerServing = $(nutritionTd[indices.perServing])
        .text()
        .toLowerCase();
      const referenceIntake = $(nutritionTd[indices.referenceIntake])
        .text()
        .toLowerCase();

      if (nutritionRow !== "") {
        rawFoodData.push(nutritionRow);
      }

      // rawFoodData["per100g"][initialLabel] = valuesPer100g;
      // rawFoodData["perServing"][initialLabel] = valuesPerServing;
      // rawFoodData["referenceIntake"][initialLabel] = referenceIntake;
    });
    // mapToLabel(rawFoodData, "per100g");
    // console.log(rawFoodData);
    return rawFoodData;
  } catch (error) {
    console.error(error);
  }
}

function getTableIndexes(tableHeaderData, indices) {
  const per100 = "100";
  const refIntake = [
    "ri",
    "reference",
    "intake",
    "intake*",
    "%ri",
    "†ri",
    "†",
    "ri*",
  ];
  const count = {};

  if (tableHeaderData.length < 1) {
    console.log("Not enough data exists");
  }

  const typicalValues = tableHeaderData.findIndex((word) =>
    word.includes("typical values"),
  );
  indices.typicalValues = typicalValues;

  const findPer100 = tableHeaderData.findIndex((word) => word.includes(per100));
  indices.per100 = findPer100;

  const tableHeading = tableHeaderData.map((heading) => {
    return heading.split(" ");
  });

  for (let i = 0; i < tableHeading.length; i++) {
    refIntake.forEach((word) => {
      for (let j = 0; j < tableHeading[i].length; j++) {
        if (word === tableHeading[i][j]) {
          count[i] = (count[i] || 0) + 1;
        }
      }
    });
  }

  let currentVal = 0;

  for (const [key, value] of Object.entries(count)) {
    if (value > currentVal) {
      indices.referenceIntake = key;
      currentVal = value;
    }
  }
  indices.perServing = findMissingNum(
    tableHeaderData.length,
    Object.values(indices),
  );
}

function findMissingNum(length, arr) {
  let count = 0;

  for (let i = 0; i <= length; i++) {
    if (arr.includes(count)) {
      count++;
    } else {
      return count;
    }
  }
}

export default nutritionScrape;
