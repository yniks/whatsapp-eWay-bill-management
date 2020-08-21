var { readFile, writeFile } = require("./filemanager");
async function saveSession(session) {
	return writeFile({
		path: "./WA.auth.json",
		data: JSON.stringify(session),
		encoding: "utf8",
	});
}
async function getSession() {
	return readFile({ path: "./WA.auth.json", encoding: "utf8" });
}
module.exports = { saveSession, getSession };
