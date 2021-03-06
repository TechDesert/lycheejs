
lychee.define('strainer.Fixer').requires([
	'strainer.flow.Check'
]).includes([
	'lychee.event.Emitter'
]).exports(function(lychee, global, attachments) {

	const _lychee  = lychee.import('lychee');
	const _Emitter = lychee.import('lychee.event.Emitter');
	const _flow    = lychee.import('strainer.flow');



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(states) {

		this.settings = _lychee.assignsafe({
			cwd:     lychee.ROOT.lychee,
			file:    null,
			project: null
		}, states);


		_Emitter.call(this);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('load', function() {

			let file    = this.settings.file    || null;
			let project = this.settings.project || null;

			if (file !== null && project !== null) {

				let cwd = this.settings.cwd || null;

				// XXX: lycheejs-strainer-fixer check /projects/my-project/source/Main.js
				if (cwd === _lychee.ROOT.lychee) {

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				// XXX: cd /opt/lycheejs/projects && lycheejs-strainer-fixer check my-project/source/Main.js
				} else if (cwd.startsWith(_lychee.ROOT.lychee)) {

					if (project.startsWith(_lychee.ROOT.lychee)) {
						project = project.substr(_lychee.ROOT.lychee.length);
					}

					lychee.ROOT.project                           = _lychee.ROOT.lychee + project;
					lychee.environment.global.lychee.ROOT.project = _lychee.ROOT.lychee + project;

				// XXX: lycheejs-strainer-fixer check /home/whatever/my-project/source/Main.js
				} else {

					lychee.ROOT.lychee                            = '';
					lychee.ROOT.project                           = project;
					lychee.environment.global.lychee.ROOT.project = project;

					// XXX: Disable sandbox for external projects
					lychee.environment.resolve = function(url) {

						if (url.startsWith('/libraries') || url.startsWith('/projects')) {
							return '/opt/lycheejs' + url;
						} else {
							return url;
						}

					};

				}


				this.trigger('init');

			} else {

				this.destroy(1);

			}

		}, this, true);

		this.bind('init', function() {

			let flow = new _flow.Check({
				sandbox:  this.settings.project,
				settings: this.settings
			});


			flow.unbind('read-sources');
			flow.unbind('read-reviews');

			flow.bind('read-sources', function(oncomplete) {

				let file      = this.settings.file;
				let sandbox   = this.sandbox;
				let stash     = this.stash;
				let namespace = this.__namespace;

				if (sandbox !== '' && stash !== null && namespace !== null) {

					console.log('strainer: READ-SOURCES ' + sandbox);


					let pkg = this.__packages[namespace] || null;
					if (pkg !== null) {

						let source = new Stuff(sandbox + '/' + file, true);

						source.onload = function(result) {

							if (result === true) {
								this.sources = [ source ];
								oncomplete(true);
							} else {
								oncomplete(false);
							}

						}.bind(this);

						source.load();


					} else {
						oncomplete(false);
					}

				} else {
					oncomplete(false);
				}

			}, flow);

			flow.bind('complete', function() {

				let cwd = this.settings.cwd;


				let length = flow.errors.length;
				if (length === 0) {

					console.error('\n0 problems');

					this.destroy(0);

				} else {

					flow.errors.forEach(function(err) {

						let path = err.url;
						if (
							path.startsWith('/opt/lycheejs') === false
							&& path.startsWith(cwd) === false
						) {
							path = cwd + '/' + err.url;
						}


						let rule = err.rule    || 'parser-error';
						let line = err.line    || 0;
						let col  = err.column  || 0;
						let msg  = err.message || 'Parsing error: unknown';
						if (msg.endsWith('.') === false) {
							msg = msg.trim() + '.';
						}


						let message = '';

						message += path.substr(cwd.length + 1);
						message += ':' + line;
						message += ':' + col;
						message += ': ' + msg;
						message += ' [' + rule + ']';

						console.error(message);

					});

					console.error('\n' + length + ' ' + (length === 1 ? 'problem' : 'problems'));

					this.destroy(1);

				}

			}, this);

			flow.bind('read-reviews', function(oncomplete) {
				oncomplete(true);
			}, flow);

			flow.bind('error', function(event) {
				this.destroy(1);
			}, this);


			flow.init();


			return true;

		}, this, true);

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Emitter.prototype.serialize.call(this);
			data['constructor'] = 'strainer.Fixer';


			let states = _lychee.assignunlink({}, this.settings);
			let blob   = data['blob'] || {};


			data['arguments'][0] = states;
			data['blob']         = Object.keys(blob).length > 0 ? blob : null;


			return data;

		},



		/*
		 * MAIN API
		 */

		init: function() {

			this.trigger('load');

			return true;

		},

		destroy: function(code) {

			code = typeof code === 'number' ? code : 0;


			this.trigger('destroy', [ code ]);

			return true;

		}

	};


	return Composite;

});

