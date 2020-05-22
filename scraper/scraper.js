const puppeteer = require("puppeteer");
const util = require('util');
const stream = require('stream');
const download = require("image-downloader");
const fs = require("fs");
const path = require('path');
const csv = require('fast-csv');

const FISH_URL = "https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons)";
const BUG_URL = "https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons)";
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

  await browser.close();
  const arr = JSON.parse(result);
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
        imageURL: url,
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

async function loadMusic() {
  /* Uses music.csv, which was exported manually from a community ACNH Google Sheet
   * See https://docs.google.com/spreadsheets/d/13d_LAJPlxMa_DubPTuirkIV4DERBMXbrWQsmSh8ReK4/edit#gid=83555737
   * Note:
   *  > We fully welcome the use of our data for creators to make websites or applications from for the betterment of the Animal Crossing community.
   *  > If you use our data for an app or site, please provide a link back to the spreadsheet on your page, and contact us to get your name added to the list of partners.
   *
   * Also uses acnhcdn.com for raw image data
   */
  const CATALOG_CODES = {
    'Not in catalog': "not_in_catalog",
    'For sale': "for_sale",
    'Not for sale': "not_for_sale"
  }

  const arr = [];
  const addMusicToList = (row) => {
    if (row.Catalog === 'Not in catalog') {
      // Skip music that can't be collected
      return;
    }

    arr.push({
      name: row.Name,
      sellPrice: Number(row.Sell),
      source: CATALOG_CODES[row.Catalog] || null,
      imageURL: `https://acnhcdn.com/latest/FtrIcon/${row.Filename}.png`
    });
  }

  const pipeline = util.promisify(stream.pipeline);
  await pipeline(
    fs.createReadStream(path.resolve(__dirname, 'data', 'music.csv')),
    csv.parse({ headers: true })
    .on('error', error => console.error(error))
    .on('data', row => addMusicToList(row))
  )

  await loadImages(arr);
  fs.writeFileSync("music.json", JSON.stringify(arr));
  return arr;
}

async function loadImages(arr) {
  for (const critter of arr) {
    const filename = await download.image({
      url: critter.imageURL,
      dest: getPath(critter),
    });
  }
}

function getPath(critter) {
  const { name } = critter;
  if (critter.hasOwnProperty("hasForgery")) {
    return `art_img/${getKey(name)}.png`;
  } else if (critter.hasOwnProperty("source")) {
    return `music_img/${getKey(name)}.png`;
  }
  return `img/${getKey(name)}.png`;
}

function getKey(name) {
  return name
    .toLowerCase()
    .replace(/[- ]/g, "_")
    .replace(/['&.]/g, "")
    .normalize('NFKD').replace(/[^\w]/g, ''); // Strip diacritics from names
}

function createImgMap(arr) {
  const imports = [];
  const obj = [];
  for (critter of arr) {
    const key = getKey(critter.name);
    const path = getPath(critter);

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
  if (!fs.existsSync("music_img")) {
    fs.mkdirSync("music_img");
  }
  const bugs = await loadBugs();
  const fish = await loadFish();
  const fossils = await loadFossils();
  const art = await loadArt();
  const music = await loadMusic();
  createImgMap([...bugs, ...fish, ...fossils, ...art, ...music]);
}

run();
