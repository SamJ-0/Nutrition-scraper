import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

const url = "";

const foodData = {};

async function nutritionScrape() {
  const { data: html } = await axios.get(url);
  const $ = cheerio.load(html);

  $(".nutrition-table tr").each((i, row) => {
    const nutritionData = $(row).find("td").text();
    const label = $($(row).find("td")[0]).text();
    const valuesPer100g = $($(row).find("td")[1]).text();
    const valuesPerServing = $($(row).find("td")[2]).text();
    console.log(`${label}: ${valuesPer100g}`);
  });
}

nutritionScrape();
