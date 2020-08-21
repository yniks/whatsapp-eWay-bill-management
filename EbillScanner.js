require("./cleanup");
var path = require('path')
var fs = require('fs')
var { MessageType } = require("@adiwajshing/baileys");
var { saveFile } = require("./filemanager");
const Jimp = require("jimp");
var { default: jsqr } = require("jsqr");
const { getFiles } = require('./chatfiles')
async function* ScanEbills({ username = argReq("username"), as, session }) {
	for await (let { buffer, extension } of getFiles({ username, as, session, doctype: [MessageType.image] })) {
		var bpm = (await Jimp.read(buffer)).bitmap;
		var result = await jsqr(bpm.data, bpm.width, bpm.height);
		if (result) {
			var [
				ewayBill,
				supGSTN,
				month,
				day,
				year,
				hour,
				minute,
				second,
				period,
			] = result.data
				.split(" ")
				.map((s) => s.split("/"))
				.flat()
				.map((s) => s.split(":"))
				.flat()
				.map((s) => s.split("-"))
				.flat()
				.map((c) => (isNaN(Number(c)) ? c : Number(c)));
			if (!period) [month, day] = [day, month];
			yield {
				ewayBill,
				supGSTN,
				month,
				day,
				year,
				hour,
				minute,
				second,
				period,
				file: buffer,
				extension
			};
		}
	}
}
if (require.main == module) {
	var [, , ...arg] = process.argv.map((s) => s.split(":"));
	var arg = Object.fromEntries(arg);
	if (!arg.tid) {
		console.log(`
HELP:
    cid:<Client userid>
    tid:<target userid>
	out:<output directry>
`);
		return;
	}
	if (!arg.out) arg.out = './output'
	try {
		fs.mkdirSync(arg.out)
	} catch (w) { }
	var session = new (require("./sessionmanager").SessionObject)(arg.cid);

	var counter = 0;
	var out = [];
	(async function () {
		for await (var m of ScanEbills({ username: arg.tid, session })) {
			console.info('got::' + (counter + 1), `ewb-${m.year}-${m.month}-${m.day}-${m.ewayBill}.${m.extension}`)
			await saveFile({
				path: path.join(arg.out, `ewb-${m.year}-${m.month}-${m.day}-${m.ewayBill}.${m.extension}`),
				data: m.file,
			});
			delete m.file
			out.push(m);
			counter++;
		}
		await saveFile({
			path: path.join(arg.out, "./wa-ebills-" + Date.now() + ".json"),
			data: JSON.stringify(out),
		});
		process.exit();
	})();
} else module.exports = { ScanEbills };
