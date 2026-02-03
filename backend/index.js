import axios from "axios";
import * as cheerio from "cheerio";
import { selectors as defaultSelectors } from "./selectors.js";

let selectors = defaultSelectors;

try {
  selectors = (await import("./selectors.local.js")).selectors;
} catch (err) {
  console.log("Using default selectors:", selectors);
}

async function nutritionScrape(productUrl) {
  try {
    const rawFoodData = {
      tableHeader: [],
      name: "",
      per100g: {},
      perServing: {},
      referenceIntake: {},
    };

    const indices = {
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

    rawFoodData["tableHeader"] = tableHeaderArr;
    getTableIndexes(rawFoodData.tableHeader, indices);

    const productName = $(selectors.productName).find("h1").text();
    rawFoodData["name"] = productName;

    $(selectors.nutritionData + "tr").each((i, row) => {
      const nutritionTd = $(row).find("td");

      const initialLabel = $(nutritionTd[0]).text().toLowerCase();
      const valuesPer100g = $(nutritionTd[indices.per100]).text().toLowerCase();
      const valuesPerServing = $(nutritionTd[indices.perServing])
        .text()
        .toLowerCase();
      const referenceIntake = $(nutritionTd[indices.referenceIntake])
        .text()
        .toLowerCase();

      rawFoodData["per100g"][initialLabel] = valuesPer100g;
      rawFoodData["perServing"][initialLabel] = valuesPerServing;
      rawFoodData["referenceIntake"][initialLabel] = referenceIntake;
    });

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

  console.log(tableHeaderData);

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

  console.log(count);
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
