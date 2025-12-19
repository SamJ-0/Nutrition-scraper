import express from "express";
import cors from "cors";
import nutritionScrape from "./index.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(
  express.json({
    strict: true,
  })
);

app.post("/scrape", async (req, res) => {
  const { productUrl } = req.body;
  const scrapedData = await nutritionScrape(productUrl);
  res.json(scrapedData);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
