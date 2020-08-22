require("./cleanup");
var path = require('path')
var fs = require('fs')
var { MessageType } = require("@adiwajshing/baileys");
var { saveFile } = require("./filemanager");
const { getFiles } = require('./chatfiles')
const { parse } = require('./scanpdfbill')
async function* ScanBill({ username = argReq("username"), as, session }) {
    for await (let { buffer, extension } of getFiles({ username, as, session, doctype: [MessageType.document] })) {
        yield parse(buffer)
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
        for await (var m of ScanBill({ username: arg.tid, session })) {
            console.info('got::' + (counter + 1), m.eWayBill)
            out.push(m);
            counter++;
        }
        await saveFile({
            path: path.join(arg.out, "./pdf=bill-scans-" + Date.now() + ".json"),
            data: JSON.stringify(out),
        });
        process.exit();
    })();
} else module.exports = { ScanBill };
