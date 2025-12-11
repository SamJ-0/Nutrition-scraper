import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import { labelDictionary } from "./dictionary.js";
import { selectors as defaultSelectors } from "./selectors.js";

let selectors = defaultSelectors;

try {
  selectors = (await import("./selectors.local.js")).selectors;
} catch (err) {
  console.log("Using default selectors:", selectors);
}

const url = "";

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

async function nutritionScrape() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const tableHeaderArr = [];
    const kjPerKcal = 4.184;

    $(selectors.heading + "th").each((i, head) => {
      const tableHeading = $(head).text().toLowerCase();
      tableHeaderArr.push(tableHeading);

      getTableIndexes(i, tableHeading);
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

      // const labelMapping = labelDictionary[label];

      // if (label.includes("energy")) {
      //   if (nutritionRow.includes("kcal") && nutritionRow.includes("kj")) {
      //     const energyArrPer100 = valuesPer100g.split("/");
      //     const energyArrPerServing = valuesPerServing.split("/");

      //     kjPer100g = energyArrPer100[0].trim();
      //     kcalPer100g = energyArrPer100[1].trim();

      //     kjPerServing = energyArrPerServing[0].trim();
      //     kcalPerServing = energyArrPerServing[1].trim();
      //   } else if (nutritionRow.includes("kcal")) {
      //     kcalPer100g = valuesPer100g;
      //     kcalPerServing = valuesPerServing;
      //   } else if (nutritionRow.includes("kj")) {
      //     kjPer100g = valuesPer100g;
      //     kjPerServing = valuesPerServing;
      //   }
      // }

      // if (label !== "" && !label.includes("energy") && valuesPer100g !== "") {
      //   rawFoodData["per100g"][label] = valuesPer100g;
      // }

      // if (
      //   label !== "" &&
      //   !label.includes("energy") &&
      //   valuesPerServing !== ""
      // ) {
      //   rawFoodData["perServing"]["servingSize"] = headingPerServing;
      //   rawFoodData["perServing"][label] = valuesPerServing;
      // }
    });

    // if (kcalPer100g === undefined && kcalPerServing === undefined) {
    //   kcalPer100g = Math.round(parseInt(kjPer100g) / kjPerKcal).toString();
    //   kcalPerServing = Math.round(
    //     parseInt(kjPerServing) / kjPerKcal
    //   ).toString();
    // }

    // if (per100gIndex !== undefined) {
    //   rawFoodData.per100g.energy.kcal = kcalPer100g;
    //   rawFoodData.per100g.energy.kj = kjPer100g;
    // }

    // if (perServingIndex !== undefined) {
    //   rawFoodData.perServing.energy.kcal = kcalPerServing;
    //   rawFoodData.perServing.energy.kj = kjPerServing;
    // }

    fs.writeFileSync("rawFoodData.json", JSON.stringify(rawFoodData));

    console.log(rawFoodData);
  } catch (error) {
    console.log(error);
  }
}

nutritionScrape();

function getTableIndexes(i, tableHeading) {
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
