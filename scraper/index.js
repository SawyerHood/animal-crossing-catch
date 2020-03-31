const puppeteer = require("puppeteer");

const FISH_URL = "https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)";
const BUG_URL = "https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)";

async function loadFish() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(FISH_URL);

  const result = await page.evaluate(() => {
    const resultMap = {};
    const bodies = Array.from(
      document.querySelectorAll(".roundy.sortable tbody")
    ).map(body => Array.from(body.children, r => Array.from(r.children)));
    for (row of bodies[0]) {
      const name = row[0].textContent.trim();
      const url = row[1].children[0].href;
      const sellPrice = +row[2].textContent.trim().replace(",", "");
      const location = row[3].textContent.trim();
      const size = row[4].textContent.trim();
      const nhTime = row[5].textContent.trim();
      const nhMonths = row
        .slice(6)
        .map(cell => cell.textContent.trim() !== "-");

      const key = name.toLowerCase();

      resultMap[key] = {
        name,
        imageURL: url,
        sellPrice,
        location,
        size,
        nhTime,
        nhMonths,
      };
    }

    for (row of bodies[1]) {
      const name = row[0].textContent.trim();
      const shTime = row[5].textContent.trim();
      const shMonths = row
        .slice(6)
        .map(cell => cell.textContent.trim() !== "-");
      const key = name.toLowerCase();
      const res = resultMap[key];
      if (res) {
        res.shTime = shTime;
        res.shMonths = shMonths;
      }
    }

    return JSON.stringify(Object.values(resultMap));
  });
  
  console.log(result);
  await browser.close();
}

loadFish();
