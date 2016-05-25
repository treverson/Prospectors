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
*/


/*
	World interface
	- defines methods we need to create when adding a new world.
*/
var World = function() {
	// Idea: create an array of functions that need to be created?

	// Return initial DOM element to attach OR -- Do stepping...?
	this.init = function(display, rootEl) { /* Requires implementation */ };
	// A step in the function with time = t
	this.step = function(time, input) { /* Requires implementation */ };
	// The background layer to draw once
	this.backgroundLayer = function() { /* Requires implementation */ };
	// The actors to draw each iteration
	this.createActors = function() { /* Requires implementation */ };
	this.actors = [];
};

var Prospectors = function() {};
Prospectors.prototype = Object.create(World);
Prospectors.prototype.init = function(display, rootEl) {

	var runAnimation = function(frameFunc) {
		var lastTime = null;
		function frame(time) {
			var stop = false;
			if (lastTime != null) {
				var timeStep = Math.min(time - lastTime, 100) / 1000;
				stop = frameFunc(timeStep) === false;
			}
			lastTime = time;
			if (!stop)
				requestAnimationFrame(frame);
		}
		requestAnimationFrame(frame);
	};

	this.createActors();
	this.drawBackground();
	this.drawActors();
	var keys = this.createEventListeners();
	var start = Date.now();

	while (Date.now() - start < 1000) {
		this.step(Date.now(), keys);
	}
	console.log(this.actors);
};

/*
	step
	- Takes current time and user input,
	- Modifies actors based on these variables.
*/
Prospectors.prototype.step = function(time, input) {
	for (k in input) {
		if (input[k]) {
			console.log(k);
		}
	}
};

Prospectors.prototype.drawActors = function() {

};

Prospectors.prototype.drawBackground = function() {

};

Prospectors.prototype.createEventListeners = function() {
	var arrowCodes = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

	function trackKeys(codes) {
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
	}

	return trackKeys(arrowCodes);

};

Prospectors.prototype.backgroundLayer = function() {

};

Prospectors.prototype.createActors = function() {
	console.log('create actors');
	this.actors = [];
};

var Display = function() {

	// Create a new DOM element.
	this.create = function (name, className) {
		var elt = document.createElement(name);
		if (className) {
			elt.className = className;
		}
		return elt;	
	};
};

var main = function(world) {
	var state = world; // hmm.. let's worry about this later.
	var display = new Display();
	var rootEl = 'main';
	world.init(display, rootEl);

};