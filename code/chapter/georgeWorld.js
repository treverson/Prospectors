'use strict';

/*
Prospecters:
	- Two stages: Pickaxe stage and dynamite stage.
	- Dynamite stage:
		- Place dynamite (which costs $) on various blocks in the grid.
		- Explode dynamite. Blocks explode, falling blocks create chain reactions (e.g. some rocks crush others).
			- Maybe: harder rocks explode smaller area but have higher payout?
		- Exploded blocks sometimes reveal treasure.
		- Note: doesn't really create the "I almost got a jackpot" feeling because no "spinning".
		- During this phase, you might find a vein of ore, which takes you to...
	- Pickaxe stage:
		- Player clicks individual blocks until the mine "collapses" or is exhausted.
		- Instant gratification with no expenditure.

Design: 
	- Start with NxN grid of blocks and a certain amount of dynamite.
	- Click to place dynamite, or click a button that says "Randomly distribute X explosives" (which is modifiable).
	- Press button to detonate.
	- Cascading effects (Eventually: spacebar to skip animations -- need to figure out how...)
	- Hitting "jackpot" takes player to free-click pickaxe round.
	- Start with NxN grid of blocks
	- Click until shaft collapses (progressively higher chance over time).
		- Perhaps this can be demonstrated by an ever-increasing occurrence of "cracked" blocks.
		- Can purchase "reinforcements" to support the mine shaft and prevent cave-ins
	- Clicking "moves" the player forward, like he is creating a tunnel. This is, clearing a path.
		- Blocks don't fill in but player can choose to move forward.

Implementation notes:
	- Initialize:
		- Background
		- Initial actor state
		- Event listeners
	- Step takes current time and user input and adjust actors accordingly.

Library
	- One goal of this project is to create a platform, or library, to which worlds can be attached.
	- That is, we want to create a base framework and then be able to send arbitrary worlds to it to be run and displayed on the screen.
	- How to accomplish this?
	- First step is creating an example world or two and being able to run them. Then the common elements can be factored out.
*/

/*
	createEventListeners and runAnimation are utility functions that should be in their own module
*/
var createEventListeners = function(codes) {
	var pressed = Object.create(null);
	function handler(event) {
		if (codes.hasOwnProperty(event.keyCode)) {
			var down = event.type == 'keydown';
			pressed[codes[event.keyCode]] = down;
			event.preventDefault();
		}
	}
	addEventListener('keydown', handler);
	addEventListener('keyup', handler);
	return pressed;
};

var runAnimation = function(frameFunc) {
	var lastTime = null; // Time since animation started
	function frame(time) {
		var stop = false;
		if (lastTime != null) {
			var timeStep = Math.min(time - lastTime, 100) / 1000; 
			stop = frameFunc(timeStep) === false; // If the frameFunc returns false, stop animation.
		}
		lastTime = time;
		if (!stop) {
			requestAnimationFrame(frame);
		}
	}
	requestAnimationFrame(frame);
};

/*
	World interface
	- defines methods we need to create when adding a new world.
*/
var World = function() {
	// Idea: create an array of functions that need to be created?

	// Return initial DOM element to attach OR -- Do stepping...?
	this.init = function(display) { /* Requires implementation */ };
	// A step in the function with time = t
	this.step = function(time, input) { /* Requires implementation */ };
	// The background layer to draw once
	this.createBackgroundLayer = function() { /* Requires implementation */ };
	// The actors to draw each iteration
	this.createActors = function() { /* Requires implementation */ };
	this.actors = [];
	this.display;
	this.keyCodes;
	this.keys;
};

var Prospectors = function() {};
Prospectors.prototype.init = function(display) {
	this.prototype = Object.create(World);

	// Send elements to Display to draw.
	this.display = display;

	// The keys we care about.
	this.keyCodes = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

	// The positions of all the actors
	this.actorGrid = [];

	this.width = 20;
	this.height = 20;

	// Initializes our this.actors
	this.createActors();

	// Draw initial frame
	this.display.drawBackground(this.createBackgroundLayer());
	this.display.drawActors(this.actors);

	// Not sure what this number means exactly but we need it.
	this.stepDuration = 0.1;

	// Variable to decide how often we listen to the input, will be used in this.step.
	// this.minStep = 100;

	// What keys were last pressed?
	this.keys = createEventListeners(this.keyCodes); // This is a higher-level variable --> We want access to it outside the World (later).

	var lastTime = Date.now();

	// Reference to this.
	var thisP = this;

	// Begin animation
	runAnimation(function(step) {
		thisP.step(step);
		thisP.display.drawFrame();
	});
};

/*
	step
	- Takes current time and checks user input.
	- Modifies actors based on these variables.
	- wowwwwwwwwwwwwwwwwwwwwwww I really don't need to do steps for non-realtime animation.
*/
Prospectors.prototype.step = function(step) {
	while (step > 0) {
		// Might instead want to go bottom left to top right, so we can create falling block chains.
		for (var j = this.height - 1; j >= 0; j-- ) {
			for (var i = this.width - 1; i >= 0; i--) {
				this.actors[i][j].act(this.actors);
			}
		}
		step -= this.stepDuration;
	}
};

Prospectors.prototype.createBackgroundLayer = function() {
	// Nothing to do.
};

Prospectors.prototype.createActors = function() {
	this.actors = [];
	for(var i = 0; i < this.width; i++) {
		var actorGridRow = [];
		for(var j = 0; j < this.height; j++) {
			actorGridRow.push(new Block(this, i, j));
		}
		this.actors.push(actorGridRow);
	}
};

Prospectors.prototype.swap = function(x1, y1, x2, y2) {

	this.actors[x1][y1].x = x2;
	this.actors[x1][y1].y = y2;
	this.actors[x2][y2].x = x1;
	this.actors[x2][y2].y = y1;

	var t = this.actors[x1][y1];
	this.actors[x1][y1] = this.actors[x2][y2];
	this.actors[x2][y2] = t;
};

var Block = function(world, x, y, type) {
	this.world = world;
	this.x = x;
	this.y = y;	
	this.type = type || 'basic';

	this.act = function() {
		if (this.type !== 'empty') {
			if (world.actors[this.x][this.y + 1].type === 'empty') {
				world.swap(this.x, this.y, this.x, (this.y + 1));
			}
		}
	};

	this.update = function(x, y) {
		this.x = x;
		this.y = y;
	};
};

var Display = function(parent) {

	this.wrap;
	this.backgroundLayer;
	this.actorLayor;

	this.init = function() {
		this.wrap = parent.appendChild(this.create('div', 'game'));
	};

	// Create a new DOM element.
	this.create = function (name, className) {
		var elt = document.createElement(name);
		if (className) {
			elt.className = className;
		}
		return elt;	
	};

	this.drawFrame = function() {
		this.removeActors();
		this.drawActors();
	};

	this.drawBackground = function(backgroundLayer) {
		// create an element and save it as this.backgroundLayer
	}

	this.drawActors = function() {
		// Draw actors, save in this.actorLayor
		// The actorLayer, I guess, should be an element super-imposed on the backgroundLayer element.
	};

	this.removeActors = function() {
		// Remove actors
		// I'm thinking Display should take a World because then the Display can operate on a generic World.
	};

	this.init();
};

var main = function(world) {
	var display = new Display(document.body, world);
	world.init(display);

};