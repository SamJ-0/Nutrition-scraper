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
    });

    rawFoodData["tableHeader"] = tableHeaderArr;
    getTableIndexes(rawFoodData.tableHeader);

    const productName = $(selectors.productName).find("h1").text();
    rawFoodData["name"] = productName;

    $(selectors.nutritionData + "tr").each((i, row) => {
      const nutritionTd = $(row).find("td");

      const initialLabel = $(nutritionTd[0]).text().toLowerCase();
      const valuesPer100g = $(nutritionTd[indices.per100gIndex])
        .text()
        .toLowerCase();
      const valuesPerServing = $(nutritionTd[indices.perServingIndex])
        .text()
        .toLowerCase();
      const referenceIntake = $(nutritionTd[indices.referenceIndex])
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

function getTableIndexes(tableHeaderData) {
  if (tableHeaderData.length >= 2) {
    tableHeaderData.forEach((header, i) => {
      console.log(i, header);
    });
  } else {
    console.log("There isn't enough data!");
  }
}

export default nutritionScrape;
