require("./cleanup");
var path = require('path')
var fs = require('fs')
var { MessageType } = require("@adiwajshing/baileys");
var { saveFile } = require("./filemanager");
var mediatypes = [MessageType.image, MessageType.video, MessageType.document, MessageType.audio]
const { getFiles } = require('./chatfiles')
async function* Download({ username = argReq("username"), as, session, doctype = mediatypes }) {
    yield* getFiles({ username, as, session, doctype })
}
if (require.main == module) {
    var [, , ...arg] = process.argv.map((s) => s.split(":"));
    var arg = Object.fromEntries(arg);
    if (!arg.tid || (!(mediatypes.includes(MessageType[arg.type])))) {
        console.log(`
HELP:
    type:<media type (image|video|audio|document)>
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
    (async function () {
        for await (var m of Download({ username: arg.tid, session, doctype: [MessageType[arg.type]] })) {
            counter++;
            console.info('got::' + counter, `file-${counter}.${m.extension}`)
            await saveFile({
                path: path.join(arg.out, `file-${counter}.${m.extension}`),
                data: m.buffer,
            });
        }
        process.exit();
    })();
} else module.exports = { Download };
