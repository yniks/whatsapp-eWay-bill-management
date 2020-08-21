var fs = require("fs");
const {
	functions: { argReq },
} = require("./utils");
async function saveFile({ path = argReq("path"), data = argReq("data") }) {
	return new Promise((res, rej) => {
		fs.writeFile(path, data, "utf8", (err) => (err ? rej(err) : res()));
	});
}
async function readFile({ path = argReq("path") }) {
	return new Promise((res, rej) => {
		fs.readFile(path, "utf8", (err, data) =>
			err ? res(null) : res(JSON.parse(data))
		);
	});
}
module.exports = { saveFile, readFile };
