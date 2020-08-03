var [, , username, dir] = process.argv;
var session = await getSession();
if (session) client.loadAuthInfoFromBase64(session);
[user, chats, contacts] = await client.connect();
if (!session) await saveSession(client.base64EncodedAuthInfo());
else console.log("Logged in from saved Session!");
hasInitialized = true;
