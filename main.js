const fs = require("fs");
var { WAClient, MessageType } = require("./wa/lib/WAClient/WAClient");
const { getSession, saveSession } = require("./WA_Session");
const { default: jsqr } = require("jsqr");
var client = new WAClient();
async function Start() {
	var session = await getSession();
	if (session) client.loadAuthInfoFromBase64(session);
	var [user, chats, contacts] = await client.connect();
	if (!session) await saveSession(client.base64EncodedAuthInfo());
	else console.log("Logged in from saved Session!");
	const Jimp = require("jimp");
	var modi = contacts.find((c) => c.name?.search(/Modi\ I/) >= 0);
	var qrs = [];

	client.loadEntireConversation(modi.jid, async function downloadIfImage(m) {
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
					var obj = {
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
					console.table(obj);
					qrs.push(obj);
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			fs.writeFileSync("./Data.ebills.json", JSON.stringify(qrs));
		}
	});
}
if (require.main == module) Start();
else module.exports = Start;
