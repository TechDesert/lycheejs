
lychee.define('studio.net.Server').includes([
	'lychee.net.Server'
]).exports(function(lychee, global, attachments) {

	const _Server = lychee.import('lychee.net.Server');



	/*
	 * HELPERS
	 */

	const _on_stash_sync = function(data) {

		let root  = lychee.ROOT.project;
		let stash = this.stash;

		if (stash !== null) {

			lychee.ROOT.project = lychee.ROOT.lychee;

			for (let id in data.assets) {

				let asset = lychee.deserialize(data.assets[id]);
				if (asset !== null) {
					stash.write(id, asset);
				}

			}

			lychee.ROOT.project = root;

		}

	};



	/*
	 * IMPLEMENTATION
	 */

	const Composite = function(data, main) {

		let states = Object.assign({}, data);


		_Server.call(this, states);

		states = null;



		/*
		 * INITIALIZATION
		 */

		this.bind('connect', function(remote) {

			console.log('studio.net.Server: Remote connected (' + remote.id + ')');


			let service = remote.getService('stash');
			if (service !== null) {
				service.bind('sync', _on_stash_sync, main);
			}

		}, this);

		this.bind('disconnect', function(remote) {

			console.log('studio.net.Server: Remote disconnected (' + remote.id + ')');

		}, this);


		this.connect();

	};


	Composite.prototype = {

		/*
		 * ENTITY API
		 */

		// deserialize: function(blob) {},

		serialize: function() {

			let data = _Server.prototype.serialize.call(this);
			data['constructor'] = 'studio.net.Server';


			return data;

		}

	};


	return Composite;

});

