#!/usr/local/bin/lycheejs-helper env:node

const _ROOT = process.env.LYCHEEJS_ROOT || '/opt/lycheejs';
const _PORT = parseInt(process.argv[2], 10);
const _HOST = process.argv[3] === 'null' ? null : process.argv[3];

require(_ROOT + '/libraries/crux/build/node/dist.js')(__dirname);



/*
 * INITIALIZATION
 */

(function(lychee, global) {

	lychee.pkg('build', 'node/main', function(environment, profile) {

		if (environment !== null) {

			lychee.init(environment, {
				debug:   false,
				sandbox: false,
				profile: {
					renderer: null,
					client:   null,
					server:   {
						host: _HOST,
						port: _PORT
					}
				}
			});

		}

	});

})(lychee, typeof global !== 'undefined' ? global : this);

