# Animal Crossing Catch

Animal Crossing Catch is a minimal, mobile friendly site for keeping track of fish and bugs you can catch in _Animal Crossing: New Horizons_.

<img src="https://i.imgur.com/vxwNRi4.png" height="500" />

## Philosophy

- Create a companion app to the game that can easily be used while playing from any device
- Make it easy to use and navigate without excess explanation
- Offline first: most features should work without network access on a mobile device (ex: playing Switch on a plane)
- Up-to-date: We should make sure that the data is always the most accurate available

## Building and running:

The site is written using Typescript, React, and Create React App. The recommended way to get up and running is via CodeSandbox, which will give you an editable copy of the site right from your browser. You can then make an edit and open a pull request without downloading anything to your computer.

[![Edit whatcanicatchnow](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/SawyerHood/animal-crossing-catch/tree/master/?fontsize=14&hidenavigation=1&theme=dark)

## Data

All of the data is currently generated from the animalcrossing Fandom wiki.

We have a static process that will scrape the site, download the images, and generate files to be used by the main app. To update the data clone the repo locally and run the following:

```
cd scraper
node scraper.js
```

You should then be able to copy the updated files (fish.json, bugs.json, imgMap.js, and the img folder) into the src directory.
