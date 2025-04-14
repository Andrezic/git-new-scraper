const HttpsProxyAgent = require('https-proxy-agent');

const proxyUsername = process.env.BRIGHTDATA_PROXY_USER;
const proxyPassword = process.env.BRIGHTDATA_PROXY_PASS;
const proxyHost = process.env.BRIGHTDATA_PROXY_HOST;
const proxyPort = process.env.BRIGHTDATA_PROXY_PORT;

const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
const agent = new HttpsProxyAgent(proxyUrl);

module.exports = agent;
