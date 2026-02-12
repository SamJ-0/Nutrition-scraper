import axios from "axios";
import * as cheerio from "cheerio";
import { selectors as defaultSelectors } from "./selectors.js";
import processData from "./dataCleaning.js";

let selectors = defaultSelectors;

try {
  selectors = (await import("./selectors.local.js")).selectors;
} catch (err) {
  console.log("Using default selectors:", selectors);
}

async function nutritionScrape(productUrl) {
  try {
    const rawFoodData = [];

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

    const productName = $(selectors.productName).find("h1").text();
    rawFoodData.push(productName);

    $(selectors.nutritionData + "tr").each((i, row) => {
      const nutritionTd = $(row).find("td");

      const nutritionRow = $(row).find("td").text().toLowerCase();

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
    });
    processData(rawFoodData);
    console.log(rawFoodData);
    return rawFoodData;
  } catch (error) {
    console.error(error);
  }
}

export default nutritionScrape;
