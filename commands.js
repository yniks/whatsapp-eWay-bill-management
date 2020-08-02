//@ts-check
var pane = document.querySelector("#pane-side > div:nth-child(1) > div > div");
pane.children[0].querySelector("span[title]");
var people = [...pane.children]
	.map((child) => child.querySelector("span[title]").innerText)
	.reverse();
var y = [];
function openChat(person) {
	person = new RegExp(person);
	var personTab = [
		...document.querySelector("#pane-side > div:nth-child(1) > div > div")
			.children,
	].find((child) => person.test(child.querySelector("span[title]").innerText));
	return personTab;
}
function getChatPage(person) {
	var chatTab = openChat(person);
	return document.querySelector(
		'[aria-label="Message list. Press right arrow key on a message to open message context menu."]'
	);
}
// async function ocr(url = "/image.png") {
// 	var worker = Tesseract.createWorker({
// 		logger: (m) => console.log(m), // Add logger here
// 	});
// 	await worker.load();
// 	await worker.loadLanguage("eng");
// 	await worker.initialize("eng");
// 	await worker.setParameters({
// 		tessedit_char_whitelist: "0123456789",
// 	});
// 	var {
// 		data: { text },
// 	} = await worker.recognize(url);
// 	await worker.terminate();
// 	return text;
// }
// async function extractValue(date, useOld = false, offset = -1) {
// 	var text = !useOld ? await ocr() : window.text;
// 	window.text = text;
// 	var lines = text.split("\n");
// 	var dateAt = lines.findIndex(
// 		(line) => line.search(new RegExp(date + "$")) >= 0
// 	);
// 	if (typeof dateAt == "undefined" || Number(dateAt) < 2)
// 		throw "Date not found";
// 	var docNum = lines[dateAt + offset].trimEnd().split(" ");
// 	docNum = docNum[docNum.length - 1];
// 	return docNum;
// }
// async function extractDocNumber(date, useOld = false) {
// 	return extractValue(date, useOld, -1);
// }
// async function extractPrice(date, useOld = false) {
// 	return extractValue(date, useOld, 2);
// }

function scrollUp(chatBox, timeout = 20000) {
	var initLength = chatBox.childElementCount;
	chatBox.children[0].scrollIntoView(false);
	return new Promise((res, rej) => {
		var timeAtStart = Date.now();
		var interval = setInterval(() => {
			if (initLength < chatBox.childElementCount) {
				clearInterval(interval);
				res();
			} else if (timeAtStart + timeout < Date.now()) {
				clearInterval(interval);
				rej();
			}
		});
	});
}
async function* readChats(chatBox) {
	var index = 0;
	var chats = chatBox.children;
	while (true) {
		if (chats.length == index) await scrollUp(chatBox);
		var element = chats[chats.length - index - 1];
		yield element;
		var isLast = !!element.querySelector("  span[data-icon=lock-small]");
		if (isLast) return true;
		index++;
	}
}
function extractChatText(chatitem) {
	return chatitem.querySelector(".selectable-text").innerText;
}
function listChats(generator) {
	return [...generator].map(extractChatText);
}
function ScanImages(chatBox, lastDays = 1) {}
var puppeteer = require("puppeteer");
var browser = await puppeteer.launch({
	executablePath: "chromium-browser", //process.env.EXECUTABLE_PATH,
	headless: true,
	userDataDir: "./profile",
	defaultViewport: null,
	args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1920,768"],
});

var page = await browser.newPage();
await page.setUserAgent(
	"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.105 Safari/537.36"
);
await page.goto("https://www.google.com");

console.log(await page.evaluate("navigator.userAgent"));
await page.screenshot({ path: "./ss.png" });
await browser.close();
