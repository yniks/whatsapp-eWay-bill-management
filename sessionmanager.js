const fs = require("fs");

const Sessions = new Map();
try {
	var stored = require("./WA.auth.json");
	for (var each in stored) {
		Sessions.set(each, stored[each]);
	}
} catch (e) {}
class SessionObject {
	username;
	constructor(username) {
		this.username = username;
	}
	get data() {
		return Sessions.get(this.username);
	}
	update(data) {
		Sessions.set(this.username, data);
	}
}
process.on("cleanup", async function () {
	console.info("Saving file:");
	fs.writeFileSync(
		"WA.auth.json",
		JSON.stringify(Object.fromEntries(Sessions.entries()))
	);
});
module.exports = { SessionObject };
