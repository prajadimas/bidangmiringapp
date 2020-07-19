console.log(location.href);

function extend() {
	var result = {};
	for (var i = 0; i < arguments.length; i++) {
		var attributes = arguments[i];
		for (var key in attributes) {
			result[key] = attributes[key];
		}
	}
	return result;
}

function decode(s) {
	return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
}

var getData = null;

window.api.receive("fromMain", (r) => {
	if (r.cookies) {
		// console.log(data.cookies);
		getData = r.cookies;
	}
});

var Cookies = {
	set: function (key, value, attributes) {
		try {
			var result = JSON.stringify(value);
			if (/^[\{\[]/.test(result)) {
				value = result;
			}
		} catch (e) {};
		value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
		key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);
		attributes = extend({ name: key }, { value: value }, attributes);
		window.api.send("toMain", { state: "cookies store", action: "set", value: attributes });
		return attributes;
	},
	get: function (key, json) {
		window.api.send("toMain", { state: "cookies store", action: "get", value: key });
		return getData;
	},
	remove: function (key, attributes) {
		window.api.send("toMain", { state: "cookies store", action: "set", value: attributes });
		return attributes;
	}
}

console.log(Cookies.set("number", "satu"))
console.log(Cookies.get())

/*
var Cookies = {
	get: function (key, json) {
		if (typeof document === 'undefined') {
			return;
		}

		var jar = {};
		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all.
		var cookies = document.cookie ? document.cookie.split('; ') : [];
		var i = 0;

		for (; i < cookies.length; i++) {
			var parts = cookies[i].split('=');
			var cookie = parts.slice(1).join('=');

			if (!json && cookie.charAt(0) === '"') {
				cookie = cookie.slice(1, -1);
			}

			try {
				var name = decode(parts[0]);
				cookie = (converter.read || converter)(cookie, name) || decode(cookie);

				if (json) {
					try {
						cookie = JSON.parse(cookie);
					} catch (e) {}
				}

				jar[name] = cookie;

				if (key === name) {
					break;
				}
			} catch (e) {}
		}

		return key ? jar[key] : jar;
	}
}

function () {

	function init(converter) {

		function api() {}

		function set(key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({ path: '/' }, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ? converter.write(value, key) : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get(key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) || decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false); // read as raw
		};
		api.getJSON = function (key) {
			return get(key, true) // read as json
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}

// JS Cookies

;(function (factory) {

	var registeredInModuleLoader;

	if (typeof define === "function" && define.amd) {
		define(factory);
		registeredInModuleLoader = true;
	}

	if (typeof exports === "object") {
		module.exports = factory();
		registeredInModuleLoader = true;
	}

	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}

}(function () {

	function extend() {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[i];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function decode(s) {
		return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
	}

	function init(converter) {

		function api() {}

		function set(key, value, attributes) {
			if (typeof document === 'undefined') {
				return;
			}

			attributes = extend({ path: '/' }, api.defaults, attributes);

			if (typeof attributes.expires === 'number') {
				attributes.expires = new Date(new Date() * 1 + attributes.expires * 864e+5);
			}

			// We're using "expires" because "max-age" is not supported by IE
			attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

			try {
				var result = JSON.stringify(value);
				if (/^[\{\[]/.test(result)) {
					value = result;
				}
			} catch (e) {}

			value = converter.write ? converter.write(value, key) : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);

			key = encodeURIComponent(String(key)).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/[\(\)]/g, escape);

			var stringifiedAttributes = '';
			for (var attributeName in attributes) {
				if (!attributes[attributeName]) {
					continue;
				}
				stringifiedAttributes += '; ' + attributeName;
				if (attributes[attributeName] === true) {
					continue;
				}

				// Considers RFC 6265 section 5.2:
				// ...
				// 3.  If the remaining unparsed-attributes contains a %x3B (";")
				//     character:
				// Consume the characters of the unparsed-attributes up to,
				// not including, the first %x3B (";") character.
				// ...
				stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
			}

			return (document.cookie = key + '=' + value + stringifiedAttributes);
		}

		function get(key, json) {
			if (typeof document === 'undefined') {
				return;
			}

			var jar = {};
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all.
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (!json && cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = decode(parts[0]);
					cookie = (converter.read || converter)(cookie, name) || decode(cookie);

					if (json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					jar[name] = cookie;

					if (key === name) {
						break;
					}
				} catch (e) {}
			}

			return key ? jar[key] : jar;
		}

		api.set = set;
		api.get = function (key) {
			return get(key, false); // read as raw
		};
		api.getJSON = function (key) {
			return get(key, true) // read as json
		};
		api.remove = function (key, attributes) {
			set(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.defaults = {};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));

var Sensor = Cookies.noConflict();
var numberOfSensor = 0;

if (Sensor.get("number")) {
	numberOfSensor = Number(Sensor.get("number"));
}

var sensor = {
	lists: function () {
		let content = [];
		if (numberOfSensor > 0) {
			for (var i = 0; i < numberOfSensor; i++) {
				let template = new Object();
				template[i + 1] = Sensor.get((i + 1).toString());
				content.push(template);
			}
		}
		return content;
	},
	prop: function (key) {
		if (key) {
			if (Sensor.get(key.toString())) {
				return Sensor.get(key.toString());
			} else {
				return ;
			}
		} else {
			return ;
		}
	},
	add: function (prop) {
		if (prop) {
			Sensor.set((numberOfSensor + 1).toString(), prop);
			Sensor.set("number", numberOfSensor + 1);
		}
	},
	del: function (key) {
		if (key) {
			Sensor.remove(key.toString());
			Sensor.set("number", numberOfSensor - 1);
		}
	},
	count: function () {
		if (Sensor.get("number")) {
			numberOfSensor = Number(Sensor.get("number"));
		}
		return numberOfSensor;
	}
}
 */
