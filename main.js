const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.setViewport({width: 1200, height: 800});
  await page.goto('http://optc-db.github.io/characters/', {waitUntil: "networkidle0"});

  var has_next_page = true;
  var units = [];
  var index = 1;
  
  await page.select('select[name="mainTable_length"]', '100');

  while(has_next_page) {

    var new_units = await page.evaluate(unit_names => {
      unit_names = [];
      document.querySelectorAll('#mainTable > tbody > tr').forEach(line => {
        unit_names.push(line.children[1].children[1].innerText);
      });
      return unit_names;
    });

    units.push(...new_units);

    has_next_page = await page.evaluate(() => {
      return !document.querySelector('#mainTable_paginate .next').classList.contains('disabled');
    });

    if (has_next_page) {
      await page.click('#mainTable_paginate ul li:last-child a', {waitUntil: "networkidle0"});
      //await page.waitFor(500);
    }

  }

  console.log(units);

  fs.writeFile('units.json', JSON.stringify(units), (err) => {
    if (err) throw err;
    console.log('File saved');
  });

  await browser.close();
})();

// Credit: Jihee Jeong
//          ()()
//          (oo)
//          ()()
//          (  )
//          ()()
