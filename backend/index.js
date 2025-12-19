import axios from "axios";
import * as cheerio from "cheerio";
import cleanData from "./dataCleaning.js";
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
      per100gIndex: "",
      perServingIndex: "",
      referenceIndex: "",
    };

    const { data: html } = await axios.get(productUrl);
    const $ = cheerio.load(html);

    const tableHeaderArr = [];

    $(selectors.heading + "th").each((i, head) => {
      const tableHeading = $(head).text().toLowerCase();
      tableHeaderArr.push(tableHeading);

      getTableIndexes(i, indices, tableHeading);
    });

    rawFoodData["tableHeader"] = tableHeaderArr;

    const productName = $(selectors.productName).find("h1").text();
    rawFoodData["name"] = productName;

    $(selectors.nutritionData + "tr").each((i, row) => {
      const nutritionTd = $(row).find("td");

      const nutritionRow = nutritionTd.text().toLowerCase();
      const label = $(nutritionTd[0]).text().toLowerCase();
      const valuesPer100g = $(nutritionTd[indices.per100gIndex])
        .text()
        .toLowerCase();
      const valuesPerServing = $(nutritionTd[indices.perServingIndex])
        .text()
        .toLowerCase();
      const referenceIntake = $(nutritionTd[indices.referenceIndex])
        .text()
        .toLowerCase();

      rawFoodData["per100g"][label] = valuesPer100g;
      rawFoodData["perServing"][label] = valuesPerServing;
      rawFoodData["referenceIntake"][label] = referenceIntake;
    });

    cleanData(rawFoodData);
    return rawFoodData;
  } catch (error) {
    console.error(error);
  }
}

function getTableIndexes(i, indices, tableHeading) {
  if (tableHeading.includes("reference") || tableHeading.includes("ri")) {
    indices["referenceIndex"] = i;
  } else if (tableHeading.includes("100")) {
    indices["per100gIndex"] = i;
  } else if (
    tableHeading.includes("serving") ||
    (tableHeading.includes("per") && !tableHeading.includes("100"))
  ) {
    indices["perServingIndex"] = i;
  }
}

export default nutritionScrape;
