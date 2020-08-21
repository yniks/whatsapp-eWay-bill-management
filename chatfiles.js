require("./cleanup");
var path = require('path')
var fs = require('fs')
var { saveFile } = require("./filemanager");
const Jimp = require("jimp");
const { MessageType } = require("@adiwajshing/baileys");
var { connect } = require("./wa.client");
var { default: jsqr } = require("jsqr");
var mediatypes = [MessageType.image, MessageType.video, MessageType.document, MessageType.audio]
var mime = require('mime-types')
const {
    functions: { argReq },
    streams: { CallbackToStream },
} = require("./utils");
async function* getFiles({ username = argReq("username"), as, session, doctype }) {
    var { client, contacts, MessageType } = await connect({ as, session });
    var user = contacts.find((c) => c.name?.search(new RegExp(username)) >= 0);
    for await (let m of client.loadEntireConversationStream(user.jid)) {
        try {
            var type = Object.keys(m.message || {}).find((type) => mediatypes.includes(type) && doctype.includes(type))
            if (type) {
                var buffer = await client.downloadMediaMessage(m);
                yield { buffer, extension: mime.extension(m.message[type].mimetype) }
            }
        } catch (e) {
            console.error(e);
        }
    }
}
module.exports = { getFiles };
