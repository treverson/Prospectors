/*
Try to generalize this function so that we can 
have multiple displays with different behavior
(e.g. a Player display and a Game display).

Create a general display function (in World), add methods to it in each view (e.g. Prospectors)
*/
var Display = function(world) {

	this.layers = {
		parent: {
			parent: null,
			el: document.body
		},
		wrap: {
			parent: 'parent',
			el: null
		},
		game: {
			parent: 'wrap',
			el: null
		},
		background: {
			parent: 'wrap',
			el: null
		},
		actor: {
			parent: 'game',
			el: null
		}
	};

	this.layers.wrap.el = this.layers.parent.el.appendChild(DOM.create('div', 'game-wrapper'))

	this.drawLayer = function(layer, el) {
		if (this.layers[layer] && this.layers[layer].parent) {
			var l = this.layers[layer];
			var p = this.layers[l.parent];
			l.el = p.el.appendChild(el);
		} else {
			console.log("Layer: ", this.layers[layer]);
			console.log("Parent: ", this.layers[this.layers[layer].parent]);
			throw "One of the above does not exist";
		}
	}

	this.addActor = function(el) {
		this.layers.actor.el.appendChild(el);
	}

	this.removeActors = function() {
		// Remove actors
		// I'm thinking Display should take a World because then the Display can operate on a generic World.
	};
};