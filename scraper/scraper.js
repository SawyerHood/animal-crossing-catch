const puppeteer = require("puppeteer");
const download = require("image-downloader");
const fs = require("fs");

const FISH_URL = "https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)";
const BUG_URL = "https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)";
const RARITY_BASE_URL = "https://animalcrossing.fandom.com/wiki/";
const FOSSIL_URL =
  "https://animalcrossing.fandom.com/wiki/Fossils_(New_Horizons)";

const ART_URL = "https://animalcrossing.fandom.com/wiki/Artwork_(New_Horizons)";

async function loadFish() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(FISH_URL);

  const result = await page.evaluate(() => {
    const resultMap = {};
    const bodies = Array.from(
      document.querySelectorAll(".roundy.sortable tbody")
    ).map((body) => Array.from(body.children, (r) => Array.from(r.children)));
    for (row of bodies[0]) {
      const name = row[0].textContent.trim();
      const url = row[1].children[0].href;
      const sellPrice = +row[2].textContent.trim().replace(",", "");
      const location = row[3].textContent.trim();
      const size = row[4].textContent.trim();
      const time = row[5].textContent.trim();
      const nhMonths = row
        .slice(6)
        .map((cell) => cell.textContent.trim() !== "-");

      const key = name.toLowerCase();

      resultMap[key] = {
        name,
        imageURL: url,
        sellPrice,
        location,
        size,
        time,
        nhMonths,
      };
    }

    for (row of bodies[1]) {
      const name = row[0].textContent.trim();
      const shMonths = row
        .slice(6)
        .map((cell) => cell.textContent.trim() !== "-");
      const key = name.toLowerCase();
      const res = resultMap[key];
      if (res) {
        res.shMonths = shMonths;
      }
    }

    return JSON.stringify(Object.values(resultMap));
  });

  await browser.close();
  const arr = JSON.parse(result);
  await loadImages(arr);
  fs.writeFileSync("fish.json", JSON.stringify(arr));
  return arr;
}

async function loadBugs() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(BUG_URL);

  const result = await page.evaluate(() => {
    const resultMap = {};
    const bodies = Array.from(
      document.querySelectorAll(".sortable tbody")
    ).map((body) => Array.from(body.children, (r) => Array.from(r.children)));
    for (row of bodies[0]) {
      const name = row[0].textContent.trim();
      const imgChild = row[1].children[0];
      const url = imgChild ? row[1].children[0].href : null;
      const sellPrice = +row[2].textContent.trim().replace(",", "");
      const location = row[3].textContent.trim();
      const time = row[4].textContent.trim();
      const nhMonths = row
        .slice(5)
        .map((cell) => cell.textContent.trim() !== "-");

      const key = name.toLowerCase();
      resultMap[key] = {
        name,
        imageURL: url,
        sellPrice,
        location,
        time,
        nhMonths,
      };
    }

    for (row of bodies[1]) {
      const name = row[0].textContent.trim();
      const shMonths = row
        .slice(5)
        .map((cell) => cell.textContent.trim() !== "-");
      const key = name.toLowerCase();
      const res = resultMap[key];
      if (res) {
        res.shMonths = shMonths;
      }
    }

    return JSON.stringify(Object.values(resultMap));
  });

  const arr = JSON.parse(result);

  for (bug of arr) {
    await page.goto(`${RARITY_BASE_URL}${encodeURIComponent(bug.name.replace(' ', '_'))}`);
    bug.rarity = await page.evaluate(() => {
      const rarity = document.querySelector("[data-source=rarity] div").textContent;
      if (rarity.includes("Common")) {
        return "*";
      } else if (rarity.includes("Fairly")) {
        return "**";
      } else if (rarity.includes("Uncommon")) {
        return "***";
      } else if (rarity.includes("Scarce")) {
        return "****";
      } else if (rarity.includes("Rare")) {
        return "*****";
      } else {
        return "";
      }
    });
  }

  await browser.close();
  await loadImages(arr);
  fs.writeFileSync("bugs.json", JSON.stringify(arr));
  return arr;
}

async function loadFossils() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(FOSSIL_URL);

  const result = await page.evaluate(() => {
    const resultMap = {};
    const rows = Array.from(
      document.querySelectorAll(".sortable.jquery-tablesorter tbody tr")
    ).filter((r) => r.children[0].tagName === "TD");
    for (row of rows) {
      const name = row.children[0].textContent.trim();
      const imgChild = row.children[1].children[0];
      const url = imgChild ? row.children[1].children[0].href : null;
      const sellPrice = +row.children[2].textContent
        .replace(",", "")
        .replace("Bells", "")
        .trim();

      const key = name.toLowerCase();
      resultMap[key] = {
        name,
        imageURL: url,
        sellPrice,
      };
    }

    return JSON.stringify(Object.values(resultMap));
  });

  await browser.close();
  const arr = JSON.parse(result);
  await loadImages(arr);
  fs.writeFileSync("fossils.json", JSON.stringify(arr));
  return arr;
}

async function loadArt() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(ART_URL);

  const result = await page.evaluate(() => {
    const resultMap = {};
    const rows = Array.from(document.querySelectorAll(".wikitable tr")).filter(
      (r) => r.children[0].tagName === "TD"
    );
    for (row of rows) {
      const name = row.children[0].textContent.trim().replace(/\n/g, " ");
      const hasForgery = row.children[1].textContent.trim() !== "N/A";
      const desc = row.children[3].textContent.trim();

      const key = name.toLowerCase();
      resultMap[key] = {
        name,
        hasForgery,
        desc,
      };
    }
    return JSON.stringify(Object.values(resultMap));
  });

  await browser.close();
  const arr = JSON.parse(result);
  fs.writeFileSync("art.json", JSON.stringify(arr));
  return arr;
}

async function loadImages(arr) {
  for (const critter of arr) {
    const filename = await download.image({
      url: critter.imageURL,
      dest: getPath(critter.name),
    });
  }
}

function getPath(name) {
  return `img/${getKey(name)}.png`;
}

function getArtPath(name) {
  return `art_img/${getKey(name)}.png`;
}

function getKey(name) {
  return name
    .toLowerCase()
    .replace(/ /g, "_")
    .replace("'", "")
    .replace("-", "_")
    .replace(".", "");
}

function createImgMap(arr) {
  const imports = [];
  const obj = [];
  for (critter of arr) {
    const key = getKey(critter.name);
    const path = critter.hasOwnProperty("hasForgery")
      ? getArtPath(critter.name)
      : getPath(critter.name);

    imports.push(`import ${key} from './${path}'`);
    obj.push(`${key}`);
  }

  const file = `
  ${imports.join("\n")}

  export default {${obj.join(",\n")}}
  `;
  fs.writeFileSync("imgMap.js", file);
}

async function run() {
  if (!fs.existsSync("img")) {
    fs.mkdirSync("img");
  }
  const bugs = await loadBugs();
  const fish = await loadFish();
  const fossils = await loadFossils();
  const art = await loadArt();
  createImgMap([...bugs, ...fish, ...fossils, ...art]);
}

run();
