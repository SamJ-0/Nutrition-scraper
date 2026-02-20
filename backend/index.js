import axios from "axios";
import * as cheerio from "cheerio";
import { selectors as defaultSelectors } from "./selectors.js";
import processData from "./dataCleaning.js";
import { dairyMilkDataRaw } from "./sampleData/dairyMilkDataRaw.js";
import { greekStyleYogurtDataRow } from "./sampleData/greekStyleYogurtDataRaw.js";
import { bagelDataRaw } from "./sampleData/bagelDataRaw.js";

let selectors = defaultSelectors;

try {
  selectors = (await import("./selectors.local.js")).selectors;
} catch (err) {
  console.log("Using default selectors:", selectors);
}

async function nutritionScrape(productUrl) {
  try {
    const rawFoodData = [];

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
      const nutritionRow = $(row).find("td").text().toLowerCase();

      if (nutritionRow !== "") {
        rawFoodData.push(nutritionRow);
      }
    });

    return rawFoodData;
  } catch (error) {
    console.error(error);
  }
}

processData(greekStyleYogurtDataRow);

export default nutritionScrape;
