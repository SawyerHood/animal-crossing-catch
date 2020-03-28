Fish generated from https://animalcrossing.fandom.com/wiki/Fish_(New_Horizons) using:

```js
let tableBody = document.querySelector(".roundy.sortable tbody");
let rows = Array.from(tableBody.children, r => Array.from(r.children));
copy(
  JSON.stringify(
    rows.map(row => {
      const output = {};
      const name = row[0].textContent.trim();
      const url = row[1].children[0].href;
      const sellPrice = +row[2].textContent.trim().replace(",", "");
      const location = row[3].textContent.trim();
      const size = row[4].textContent.trim();
      const time = row[5].textContent.trim();
      const months = row.slice(6).map(cell => cell.textContent.trim() !== "-");
      return { name, imageURL: url, sellPrice, location, size, time, months };
    })
  )
);
```

Bugs generated from https://animalcrossing.fandom.com/wiki/Bugs_(New_Horizons) using:

```js
let tableBody = document.querySelector(".sortable tbody");
let rows = Array.from(tableBody.children, r => Array.from(r.children));
copy(
  JSON.stringify(
    rows.map(row => {
      const output = {};
      const name = row[0].textContent.trim();
      const imgChild = row[1].children[0];
      const url = imgChild ? row[1].children[0].href : null;
      const sellPrice = +row[2].textContent.trim().replace(",", "");
      const location = row[3].textContent.trim();
      const time = row[4].textContent.trim();
      const months = row.slice(5).map(cell => cell.textContent.trim() !== "-");
      return { name, imageURL: url, sellPrice, location, time, months };
    })
  )
);
```
