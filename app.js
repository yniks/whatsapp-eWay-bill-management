var puppeteer = require("puppeteer");
require("dotenv").config();
async function main() {
	var browser = await puppeteer.launch({
		executablePath: process.env.EXECUTABLE_PATH,
		headless: false,
		userDataDir: "./profile",
		defaultViewport: null,
	});
	debugger;
}
if (require.main == module) main();
else module.exports = main;
