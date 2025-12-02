import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const url = "";

const foodData = {
  name: "",
  per100g: { energy_kcal: "", energy_kj: "" },
  perServing: { energy_kcal: "", energy_kj: "" },
};

async function nutritionScrape() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    let tableHeading;
    let referenceIndex;
    let per100gIndex;
    let perServingIndex;

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
        tableHeading.includes("per average") ||
        tableHeading.includes("1/2") ||
        tableHeading.includes("slice") ||
        tableHeading.includes("wrap") ||
        tableHeading.includes("pack")
      ) {
        perServingIndex = i;
      }
    });

    const productName = $(".product-heading").find("h1").text();
    foodData["name"] = productName;

    $(".nutrition-data tr").each((i, row) => {
      const label = $($(row).find("td")[0]).text().toLowerCase();
      const nutritionRow = $(row).find("td").text().toLowerCase();

      const valuesPer100g = $($(row).find("td")[per100gIndex])
        .text()
        .toLowerCase();
      const valuesPerServing = $($(row).find("td")[perServingIndex])
        .text()
        .toLowerCase();

      if (label.includes("energy")) {
        if (nutritionRow.includes("kcal")) {
          kcalPer100g = valuesPer100g;
          kcalPerServing = valuesPerServing;
        } else if (nutritionRow.includes("kj")) {
          kjPer100g = valuesPer100g;
          kjPerServing = valuesPerServing;
        }
      }

      if (
        label != "" &&
        valuesPer100g != "" &&
        valuesPerServing != "" &&
        !label.includes("energy")
      ) {
        foodData["per100g"][label] = valuesPer100g;
        foodData["perServing"][label] = valuesPerServing;
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

    foodData.per100g.energy_kcal = kcalPer100g;
    foodData.per100g.energy_kj = kjPer100g;
    foodData.perServing.energy_kcal = kcalPerServing;
    foodData.perServing.energy_kj = kjPerServing;

    fs.writeFileSync("FoodData.json", JSON.stringify(foodData));

    console.log(foodData);
  } catch (error) {
    console.log(error);
  }
}

nutritionScrape();
