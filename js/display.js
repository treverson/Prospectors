/*
Try to generalize this function so that we can 
have multiple displays with different behavior
(e.g. a Player display and a Game display).

Create a general display function (in World), add methods to it in each view (e.g. Prospectors)
*/

define(['dom'], function(DOM) {
	return function() {
		this.layers = {
			main: {
				parent: null,
				el: document.body
			},
			wrap: {
				parent: 'main',
				el: null
			},
			overlay: {
				parent: 'wrap',
				el: null
			},
			game: {
				parent: 'wrap',
				el: null
			},
			actor: {
				parent: 'game',
				el: null
			},
			background: {
				parent: 'game',
				el: null
			}
			// <body>
			// 	<wrap>
			//		<overlay>
			//		</overlay>
			// 		<game>
			// 			<actor>
			// 			</actor>
			// 		</game>
			// 		<background>
			// 	</wrap>
			// </body>
		};

		this.init = function() {
			var p, e;
			for (l in this.layers) {
				if (!this.layers[l].el) { //ignore main
					p = this.layers[l].parent;
					e = DOM.create('div', l);
					this.layers[l].el = this.layers[p].el.appendChild(e);
				}
			}
		};

		this.drawLayer = function(layer, el) {
			if (this.layers[layer] && this.layers[layer].parent) {
				var l = this.layers[layer],
					p = this.layers[l.parent];
				l.el = p.el.appendChild(el);
			} else {
				console.log("Layer: ", this.layers[layer]);
				console.log("Parent: ", this.layers[this.layers[layer].parent]);
				throw "One of the above does not exist";
			}
		};

		this.destroy = function(layers) {
			layers.forEach(function(layer) {
				this.layers[layer].el.remove();
				this.init();
			}.bind(this));
		};

		this.addActor = function(el) {
			this.layers.actor.el.appendChild(el);
		};

		this.removeActors = function() {
			// Remove actors
			// I'm thinking Display should take a World because then the Display can operate on a generic World.
		};

		this.init();
	};
});