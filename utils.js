function argReq(name) {
	throw `Argument ${name} is required!`;
}
/**
 * Asynchronously poll a function
 * @param {Function} tryfun
 */
function waitFor(
	tryfun = argReq("tryun"),
	pollinterval = 4,
	timeout = 2147483647
) {
	return new Promise((res, rej) => {
		var intervalid = setInterval(() => {
			if (tryfun()) {
				res();
				clearInterval(intervalid);
				clearTimeout(timeoutid);
			}
		}, pollinterval);
		var timeoutid = setTimeout(() => {
			rej(Error("Polling Timout"));
			clearInterval(intervalid);
		}, timeout);
	});
}
class CallbackToStream {
	push;
	stream;
	constructor(preproc) {
		var self = this;
		var buffer = [];
		if (typeof preproc == "function") {
			var handle = (arg) => buffer.push(arg);
		} else {
			var handle = (arg) => buffer.push(preproc({ self, arg }));
		}

		self.push = handle;
		async function whenPushed() {
			/**
			 * NEED A BETTER WAY THAN THIS
			 *  SHIFT OPERATION AND waitFor() IMPLEMENTATION are not upto
			 */
			if (buffer.length) return buffer.shift();
			else {
				await waitFor((_) => !!buffer.length);
				return buffer.shift();
			}
		}
		this.stream = (async function* () {
			while (true) {
				yield await whenPushed();
			}
		})();
	}
}

module.exports = { functions: { argReq }, streams: { CallbackToStream } };
