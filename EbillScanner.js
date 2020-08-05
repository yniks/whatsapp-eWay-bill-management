require("./cleanup");
var { saveFile } = require("./filemanager");
const Jimp = require("jimp");
var { connect } = require("./wa.client");
var { default: jsqr } = require("jsqr");
const {
	functions: { argReq },
	streams: { CallbackToStream },
} = require("./utils");
async function* ScanEbills({ username = argReq("username"), as, session }) {
	var { client, contacts, MessageType } = await connect({ as, session });
	var user = contacts.find((c) => c.name?.search(new RegExp(username)) >= 0);
	for await (let m of client.loadEntireConversationStream(user.jid)) {
		try {
			if (
				Object.keys(m.message || {}).find((type) => type == MessageType.image)
			) {
				var buffer = await client.downloadMediaMessage(m);
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
					};
				}
			}
		} catch (e) {
			console.error(e);
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

`);
		return;
	}
	var session = new (require("./sessionmanager").SessionObject)(arg.cid);

	var counter = 0;
	var out = [];
	(async function () {
		for await (var m of ScanEbills({ username: arg.tid, session })) {
			console.log(counter);
			out.push(m);
			counter++;
		}
		await saveFile({
			path: "./wa-ebills-" + Date.now() + ".json",
			data: JSON.stringify(out),
		});
		process.exit();
	})();
} else module.exports = { ScanEbills };
