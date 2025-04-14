const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

async function launchBrowser() {
  return await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
  });
}

module.exports = { launchBrowser };
