/*
Try to generalize this function so that we can 
have multiple displays with different behavior
(e.g. a Player display and a Game display).

Create a general display function (in World), add methods to it in each view (e.g. Prospectors)
*/
var Display = function(world) {

	var parent = document.body;
	this.wrap;
	this.game;
	this.backgroundLayer;
	this.actorLayer;

	this.init = function() {
		this.wrap = DOM.create('div', 'game-wrapper');
		this.game = DOM.create('div', 'game');
		DOM.style(this.game, {
			width: (world.scale * world.width) + 'px',
			height: (world.scale * world.height) + 'px'
		});
		this.wrap.appendChild(this.game);
		this.wrap = parent.appendChild(this.wrap);
	};

	this.drawBackground = function(backgroundLayer) {
		this.wrap.appendChild(backgroundLayer);
	};

	this.appendChild = function(el) {
		parent.appendChild(el);
	};

	this.drawActors = function() {
		// Draw actors, save in this.actorLayer
		// The actorLayer, I guess, should be an element super-imposed on the backgroundLayer element.
		this.actorLayer = DOM.create('div', 'actor-layer');
		for (var i = 0; i < world.width; i++) {
			for (var j = 0; j < world.height; j++) {
				this.actorLayer.appendChild(world.actors[i][j].blockEl);
			}
		}
		this.game.appendChild(this.actorLayer);
	};

	// Destination is dX, dY. This is found from the location of the spot in inventory.
	// TODO: Create a stylesheet for the items! Calculate values based on the Prospectors.scale
	this.animateDrop = function(x, y, item, dX, dY) {
		var newItem = new Item();
		newItem.init(x, y, item, world.scale);
		this.actorLayer.appendChild(newItem.itemEl);
		newItem.sendToDestination(0,0);
	}

	this.removeActors = function() {
		// Remove actors
		// I'm thinking Display should take a World because then the Display can operate on a generic World.
	};
};