import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const url = "";

const foodData = { name: "", per100g: {}, perServing: {} };

async function nutritionScrape() {
  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    const productName = $(".product-heading").find("h1").text();
    foodData["name"] = productName;

    $(".nutrition-data tr").each((i, row) => {
      const label = $($(row).find("td")[0]).text();
      const valuesPer100g = $($(row).find("td")[1]).text();
      const valuesPerServing = $($(row).find("td")[2]).text();
      foodData["per100g"][label] = valuesPer100g;
      foodData["perServing"][label] = valuesPerServing;
    });

    fs.writeFileSync("FoodData.json", JSON.stringify(foodData));

    console.log(foodData);
  } catch (error) {
    console.log(error);
  }
}

nutritionScrape();
