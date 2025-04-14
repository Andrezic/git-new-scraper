const puppeteer = require('puppeteer-core');

async function launchBrowser() {
  return await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

module.exports = { launchBrowser };
