
lychee.define('game.Compositor').exports(function(lychee, game, global, attachments) {

	var Class = function(game) {

		this.renderer = game.renderer || null;;

		this.__width  = 0;
		this.__height = 0;
		this.__points = [];


		for (var i = 0; i < 10; i++) {

			this.__points.push({
				x: 0, y: 0, z: 0, w: 0
			});

		}

		if (this.renderer !== null) {

			var env = this.renderer.getEnvironment();
			this.reset(env.width, env.height);

		}

	};


	Class.prototype = {

		reset: function(width, height) {

			this.__width  = width;
			this.__height = height;

		},

		getPoint: function(index) {
			return this.__points[index];
		},

		project: function(target, point, x, y, z, depth) {

			var cameraX = (point.x || 0) - x;
			var cameraY = (point.y || 0) - y;
			var cameraZ = (point.z || 0) - z;

			var hwidth  = this.__width / 2;
			var hheight = this.__height / 2;
			var scale = depth / cameraZ;


			// x, y, depth, road width
 			target.x = Math.round(  hwidth + scale * cameraX *  hwidth );
			target.y = Math.round( hheight - scale * cameraY * hheight );
			target.z = cameraZ;
			//                                       road width (!)
			//                                       \/\/\/\/\/\/
			target.w = Math.round(           scale * 1.5 * hwidth * hwidth );

		}

	};


	return Class;

});

