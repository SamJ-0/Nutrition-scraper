import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const url = "";

const rawFoodData = {
  name: "",
  per100g: { energy: { kcal: "", kj: "" } },
  perServing: { energy: { kcal: "", kj: "" } },
};

const labelDictionary = {
  fat: "fat",
  "fat (g)": "fat",
  "total fat": "fat",
  "total fats": "fat",
  "of which saturates": "satFat",
  "of which saturates (g)": "satFat",
  "saturated fat": "satFat",
  Carbohydrate: "Carbohydrate",
  "Carbohydrate (g)": "Carbohydrate",
  fibre: "fibre",
  protein: "protein",
  salt: "salt",
};

async function nutritionScrape() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    let tableHeading;
    let referenceIndex;
    let per100gIndex;
    let perServingIndex;
    let headingPerServing;

    let kcalPer100g;
    let kcalPerServing;
    let kjPer100g;
    let kjPerServing;
    const kjPerKcal = 4.184;

    $(".tableHeading th").each((i, head) => {
      tableHeading = $(head).text().toLowerCase();

      if (
        tableHeading.includes("reference") ||
        tableHeading.includes("%") ||
        tableHeading.includes("ri")
      ) {
        referenceIndex = i;
      } else if (tableHeading.includes("100")) {
        per100gIndex = i;
      } else if (
        tableHeading.includes("serving") ||
        (tableHeading.includes("per") && !tableHeading.includes("100"))
      ) {
        perServingIndex = i;
        headingPerServing = tableHeading;
      }
    });

    const productName = $(".product-heading").find("h1").text();
    rawFoodData["name"] = productName;

    $(".nutrition-data tr").each((i, row) => {
      const label = $($(row).find("td")[0]).text().toLowerCase();
      const labelMapping = labelDictionary[label];
      const nutritionRow = $(row).find("td").text().toLowerCase();

      const valuesPer100g = $($(row).find("td")[per100gIndex])
        .text()
        .toLowerCase();
      const valuesPerServing = $($(row).find("td")[perServingIndex])
        .text()
        .toLowerCase();

      console.log(labelMapping);

      if (label.includes("energy")) {
        if (nutritionRow.includes("kcal") && nutritionRow.includes("kj")) {
          const energyArrPer100 = valuesPer100g.split("/");
          const energyArrPerServing = valuesPerServing.split("/");

          kjPer100g = energyArrPer100[0].trim();
          kcalPer100g = energyArrPer100[1].trim();

          kjPerServing = energyArrPerServing[0].trim();
          kcalPerServing = energyArrPerServing[1].trim();
        } else if (nutritionRow.includes("kcal")) {
          kcalPer100g = valuesPer100g;
          kcalPerServing = valuesPerServing;
        } else if (nutritionRow.includes("kj")) {
          kjPer100g = valuesPer100g;
          kjPerServing = valuesPerServing;
        }
      }

      if (label !== "" && !label.includes("energy") && valuesPer100g !== "") {
        rawFoodData["per100g"][label] = valuesPer100g;
      }

      if (
        label !== "" &&
        !label.includes("energy") &&
        valuesPerServing !== ""
      ) {
        rawFoodData["perServing"]["servingSize"] = headingPerServing;
        rawFoodData["perServing"][label] = valuesPerServing;
      }
    });

    if (kcalPer100g === undefined && kcalPerServing === undefined) {
      console.log(
        `${Math.round(parseInt(kjPer100g) / kjPerKcal)} ${Math.round(
          parseInt(kjPerServing) / kjPerKcal
        )}`
      );
      kcalPer100g = Math.round(parseInt(kjPer100g) / kjPerKcal).toString();
      kcalPerServing = Math.round(
        parseInt(kjPerServing) / kjPerKcal
      ).toString();
    }

    if (per100gIndex !== undefined) {
      rawFoodData.per100g.energy.kcal = kcalPer100g;
      rawFoodData.per100g.energy.kj = kjPer100g;
    }

    if (perServingIndex !== undefined) {
      rawFoodData.perServing.energy.kcal = kcalPerServing;
      rawFoodData.perServing.energy.kj = kjPerServing;
    }

    fs.writeFileSync("rawFoodData.json", JSON.stringify(rawFoodData));

    console.log(rawFoodData);
  } catch (error) {
    console.log(error);
  }
}

nutritionScrape();
