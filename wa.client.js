var { WAClient, MessageType } = require("@adiwajshing/baileys");
var ConnectedUsers = new Map();
function SearchConnectedUsers(userid) {
	return ConnectedUsers.entries().find(([{ id }]) => id === userid)[1];
}
async function connect({ qr = true, session, as }) {
	if (as) {
		var savedRes = SearchConnectedUsers(as);
		if (!savedRes) throw `No connection found for '${as}'`;
		return savedRes;
	}
	var client = new WAClient();
	if (session?.data) client.loadAuthInfoFromBase64(session.data);
	else if (!qr)
		throw "Atleast one of ['as','qr','session'] mode of connection should be chosen";
	var [user, chats, contacts] = await client.connect();
	var response = {
		session: client.base64EncodedAuthInfo(),
		MessageType,
		client,
		user,
		chats,
		contacts,
	};
	session?.update(response.session);
	return response;
}
module.exports = { connect };
