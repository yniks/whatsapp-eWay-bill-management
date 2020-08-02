var fs = require("fs");
async function saveSession(session) {
	return new Promise((res, rej) => {
		fs.writeFile("./WA.auth.json", JSON.stringify(session), "utf8", (err) =>
			err ? rej(err) : res()
		);
	});
}
async function getSession() {
	return new Promise((res, rej) => {
		fs.readFile("./WA.auth.json", "utf8", (err, data) =>
			err ? res(null) : res(JSON.parse(data))
		);
	});
}
module.exports = { saveSession, getSession };
