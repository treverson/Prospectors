/*
Try to generalize this function so that we can 
have multiple displays with different behavior
(e.g. a Player display and a Game display).

Create a general display function (in World), add methods to it in each view (e.g. Prospectors)
*/

define(['dom', 'detect'], function(DOM, Detect) {
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
			view: {
				parent: 'wrap',
				el: null
			}
		};

		this.screen = {
			w: Detect.getScreenWidth(),
			h: Detect.getScreenHeight(),
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
				l.el.appendChild(el);
			} else {
				console.log("Layer: ", this.layers[layer]);
				console.log("Parent: ", this.layers[this.layers[layer].parent]);
				throw "One of the above does not exist";
			}
		};

		this.destroy = function(layers) {
			var p, e;
			layers.forEach(function(layer) {
				p = this.layers[layer].parent;
				while(this.layers[layer].el.firstChild) {
					this.layers[layer].el.removeChild(this.layers[layer].el.firstChild);
				}
			}.bind(this));
		};

		this.init();
	};
});