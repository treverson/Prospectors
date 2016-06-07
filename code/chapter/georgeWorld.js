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

Other Gameplay:
	- Caravan
		- Participate in inter-city trade by escorting caravans or creating your own.
			- Taking ideas from Puzzle Pirates here
			- As an escort, you participate in a certain amount of battles/minigames on the journey.
			- Your success helps determine the success of the venture
		- Relies on the idea that Cities are hubs of trade-- can't buy an item in one city's auction from a second city.
			- This creates scarcity. 

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

Other Notes
	- Have a certain number of pets
	- When the player isn't active, the pets can be set to do work (such as mining or crafting).
	- They will passively generate materials that can be crafted into other things.
	- Two types of views:
		- Experiences
			- Minigames, traveling through terrain or in a city, etc.
		- Overlays
			Things that appear on top of experiences, like inventory.

Things for Sally to Do (i.e., long-term plan)
	- Animations/designs
		- LOW priority
		- make blocks explode
		- give blocks "shapes" with CSS
	- Create some sort of inventory
		- given a player with some array of objects representing items, display all the items in a grid and be able to rearrange, hover/click for details, and equip them.
		- Inventory should be small
		- May be difficult to do without 
	- Create the city/world to move around in
		- 2D grid of tiles. Player occupies one of those tiles.
		- City is one map, world is a larger map.
			- Not really sure about the purpose of the "world" yet, or how exactly it will work. Don't do it yet!
			- City is high-priority.
				-Accessible points in the city include
					* Fountain/free thing
					* Mines (for prospecting)
					* Arena
					* Auction house
					* Stores and player houses
						- Both stores and player houses occupy "real estate"-- there can only be so many!
						- Players can go inside stores (avoiding auction house tax?? To incentivize? Just an idea.)
						- Players can go inside their own houses.
						- Players can pay $$ to buy real estate.
						- If a player owns real estate, he/she can click on it to open up a building menu.
	- Create minigames
		- "Fountain" minigame (find better analogy...)
			- Randomly spawns free items when you visit it
			- Not really a game, but it's its own view/experience (i.e. not an overlay like inventory).
		- Battle minigame
			- Requires database, could be tricky.
		- Propose one! Make your own!
	- Create 'store'
		- Players can have their own personal store which they can fill up from their inventory.
		- These items are also available at the auction house, but have fixed prices (don't need bidding).
	- Auction house
		- Requires database (i.e. multiple users), could be tricky
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

var Utils = {
	printCoords: function(x, y) {
		return '(' + x + ', ' + y + ')';
	}
};

var DOM = {
	// Create a new DOM element.
	create: function (name, className) {
		var elt = document.createElement(name);
		if (className) {
			elt.className = className;
		}
		return elt;	
	},

	style: function(el, styles) {
		for (var k in styles) {
			el.style[k] = styles[k];
		}
	}
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
Prospectors.prototype.init = function(display, player) {
	this.prototype = Object.create(World);

	// Send elements to Display to draw.
	this.display = display;

	this.player = player;

	// The keys we care about. These are examples at the moment.
	this.keyCodes = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

	// The state of the game. Options include:
	// 'building'	--> Player is placing dynamite on the map.
	// 'acting'		--> Animation is occurring (actors are acting).
	this.gameState = 'building';
	this.eventQueue = [];
	this.markedActors = [];

	// The positions of all the actors
	this.actors;

	// Game size variables.
	this.width = 20;
	this.height = 20;
	this.scale = 30;

	this.randomPlayNum = 5;

	// Initializes our this.actors
	this.createActors();

	// Initialize display.
	this.display.init();

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

	// // Reference to this.
	// var self = this;

	// // Begin animation
	// runAnimation(function(step) {
	// 	self.step(step);
	// 	self.display.drawFrame();
	// });
};

Prospectors.prototype.getItem = function() {

	// 'mult' is a the relative chance of getting this item over another.
	// To pick an item, divide 1 by the sum of all the multipliers. Figure it out...
	var mkItem = function(name, mult) {
		return {
			name: name,
			mult: mult
		};
	};

	// Items will eventually be passed in from outside the game (from the universe).
	var items = [
		mkItem('blast-powder', 200),
		mkItem('coin', 100),
		mkItem('quartz', 30),
		mkItem('metal-scraps', 140)
	];

	var rand = Math.random();
	var multTotal = items.reduce(function(prev, curr) { // Total multiplier
		return prev + curr.mult;
	}, 0);
	var inverseMultTotal = 1 / multTotal; // Inverse to create ratios with.
	var runningTotal = 0; // Keep track of previous work.
	for (var i = 0; i < items.length; i++) {
		runningTotal += items[i].mult;
		if (rand < (runningTotal * inverseMultTotal)) {
			return items[i].name;
		}
	}
	return null; // Should not reach this!
};

/*
	step
	- Don't really need this right now.
*/
// Prospectors.prototype.step = function(step) {
// 	while (step > 0) {
// 		for (var i = 0; i < this.width; i++ ) {
// 			for (var j = 0; j < this.height; j++) {
// 				this.actors[i][j].act();
// 			}
// 		}
// 		step -= this.stepDuration;
// 	}
// };

Prospectors.prototype.mark = function(x, y) {
	this.markedActors.push({ x: x, y: y });
};

Prospectors.prototype.unmark = function(x, y) {
	for (var i = 0; i < this.markedActors.length; i++) {
		if (this.markedActors[i].x === x && this.markedActors[i].y === y) {
			this.markedActors.splice(i, 1);
			break;
		}
	}
};

Prospectors.prototype.sortByY = function(a, b) {
	if (a.y < b.y) {
		return 1;
	} else if (a.y === b.y) {
		return 0;
	} else {
		return -1;
	}
};

Prospectors.prototype.doPlay = function() {
	this.markedActors.sort(this.sortByY);
	var self = this;
	var callback = function() {
		doExplodes()
	};

	var doExplodes = function() {
		if (self.markedActors.length) {
			var a = self.markedActors.pop();
			self.actors[a.x][a.y].explode(callback);
		}
	};

	doExplodes();
	// var actors = this.actors;
	// this.markedActors.forEach(function(a) {
	// 	console.log('here');
	// 	actors[a.x][a.y].explode();
	// });
	//this.markedActors = [];
};

Prospectors.prototype.doRandPlay = function() {

};

Prospectors.prototype.createBackgroundLayer = function() {
	// Create menu
	var menu = DOM.create('div', 'menu');
	var play = DOM.create('button', 'clickable button norm-play');
	play.innerHTML = 'PLAY';
	play.onclick = function(self) {
		return function() {
			self.doPlay();
		};
	}(this);
	var randomPlayWrapper = DOM.create('div', 'rand-play-wrapper');
	var randomPlay = DOM.create('button', 'clickable button rand-play');
	randomPlay.innerHTML = 'RANDOM PLAY';
	randomPlay.onclick = function(self) {
		return function() {
			self.doRandPlay();
		};
	}(this);

	// Display randomPlayNum
	var randomPlayNumEl = DOM.create('div', 'rand-play-num');
	randomPlayNumEl.innerHTML = this.randomPlayNum.toString();

	// Increment randomPlayNum button
	var upTriangle = DOM.create('a', 'clickable button up-triangle');
	var upClick = function(self) {
		return function() {
			if (self.randomPlayNum < self.player.numExplosives) {
				self.randomPlayNum += 1;
				document.getElementsByClassName('rand-play-num')[0].innerHTML = self.randomPlayNum.toString();
			}
		};
	};
	upTriangle.onclick = upClick(this);

	// Decrement randomPlayNum button
	var downTriangle = DOM.create('a', 'clickable button down-triangle');
	var downClick = function(self) {
		return function() {
			if (self.randomPlayNum > 1) {
				self.randomPlayNum -= 1;
				document.getElementsByClassName('rand-play-num')[0].innerHTML = self.randomPlayNum.toString();
			}
		};
	}
	downTriangle.onclick = downClick(this);

	// Container for increment/decrement buttons
	var triangleContainer = DOM.create('div', 'triangle-container');
	triangleContainer.appendChild(upTriangle);
	triangleContainer.appendChild(downTriangle);

	var randomPlayNumContainer = DOM.create('div', 'rand-play-num-container');
	randomPlayNumContainer.appendChild(randomPlayNumEl);
	randomPlayNumContainer.appendChild(triangleContainer);

	randomPlayWrapper.appendChild(randomPlay);
	randomPlayWrapper.appendChild(randomPlayNumContainer);

	menu.appendChild(play);
	menu.appendChild(randomPlayWrapper);
	DOM.style(menu, {
		width: (this.scale * this.width) + 'px'
	});
	return menu;
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

/*
Shift instead of swap.
Randomly generate an event from the removed block and add it to the event queue!
Then delete the block, shift the rest down, and fill in a new block.
*/
Prospectors.prototype.swap = function(start, end) {

	this.actors[start.x][start.y].updateCoords(end.x, end.y);
	this.actors[end.x][end.y].updateCoords(start.x, start.y);

	var t = this.actors[start.x][start.y];
	this.actors[start.x][start.y] = this.actors[end.x][end.y];
	this.actors[end.x][end.y] = t;

};

Prospectors.prototype.shift = function(start, end) {

	this.actors[start.x][start.y].updateCoords(end.x, end.y);
	this.actors[end.x][end.y] = this.actors[start.x][start.y];

};

Prospectors.prototype.dropBlocksTo = function(x, y, callback) {
	// Drop every block above this y down a position.
	// Reduce integrity of base?
	var start, end;
	for(var j = y-1; j >= 0; j--) {
		start = { x: x, y: j };
		end = { x: x, y: j + 1 };
		this.swap(start, end);
	}
	// Drop in the block that was destroyed.
	// The timeouts are causing a display mismatch??
	var dropBlock = function (block) {
		setTimeout(block.fallIn(block, callback), 0);
	}(this.actors[x][0]);
};

var Block = function(world, x, y, type) {
	this.world = world;
	this.x = x;
	this.y = y;
	this.type = type || 'basic';
	this.integrity = 100;
	this.marked = false;
	this.buildBlockEl = function(self) {
		var classes = [
			'block',
			'clickable',
			this.type,
			'integrity-' + Math.floor(this.integrity).toString()
		];
		var el = DOM.create('div', classes.join(' '));
		DOM.style(el, {
			width: world.scale + 'px',
			height: world.scale + 'px',
			left: this.x * world.scale + 'px',
			top: this.y * world.scale + 'px'
			});
		el.onclick = function() {
			//self.explode();
			if (!self.marked) {
				self.world.mark(self.x, self.y);
				self.mark();
			} else {
				self.unmark();
				self.world.unmark(self.x, self.y);
			}
		};

		return el;
	};

	this.blockEl = this.buildBlockEl(this);

	this.mark = function() {
		this.marked = true;
		console.log('mark ' + Utils.printCoords(this.x, this.y));
		DOM.style(this.blockEl, {
			backgroundImage: 'url("image/dynamite.png")',
			boxShadow: 'inset 0 0 0 1px rgba(143,59,27,0.9),inset 0 2px 5px rgba(143,59,27,0.8)'
		});
	};

	this.unmark = function() {
		console.log('unmark ' + Utils.printCoords(this.x, this.y));
		this.marked = false;
		DOM.style(this.blockEl, {
			backgroundImage: 'none',
			boxShadow: 'inset 0 0 2px 0px #27496d'
		});
	};

	// this.act = function() {
	// 	if (this.type === 'empty') {
	// 		// Blocks above must fall.
	// 		DOM.style(this.blockEl, {
	// 			display: 'none'
	// 		});
	// 		world.dropBlocksTo(this.x, this.y);
	// 	} else if (this.type === 'dynamite') {
	// 		this.explode();
	// 		// Explode, then blocks above must fall.
	// 	} else {
	// 		// Nothing.
	// 	}
	// };

	this.updateBlockCoords = function() {
		DOM.style(this.blockEl, {
			left: (world.scale * this.x) + 'px',
			top: (world.scale * this.y) + 'px'
		});
	};

	this.explode = function(callback) {
		var drop = this.makeDrop();
		console.log("LOOT: " + drop);
		if (drop) {
			world.eventQueue.unshift(drop);
		}
		this.hideBlock();
		
		// As elsewhere, this is just for effect.
		// Better: Create a "wrapperFunc"-building function!
		// Would somehow need to take the arguments and include them in scope.
		var wrapperFunc = function(x, y) {
			setTimeout(function() {
				world.dropBlocksTo(x, y, callback);
			}, 50);
		}(this.x, this.y)
	};

	this.hideBlock = function() {
		DOM.style(this.blockEl, {
			display: 'none'
		});
		this.type = 'empty';
		this.unmark();
	};

	this.showBlock = function() {
		this.type = this.chooseNewType();
		DOM.style(this.blockEl, {
			display: 'block'
		});
	};

	this.chooseNewType = function() {
		return 'basic';
	};

	this.fallIn = function(self, callback) {
		return function() {
			self.updateCoords(self.x, -1);
			self.showBlock();
			setTimeout(function(){
				self.updateCoords(self.x, 0);
				callback();
			}, 50);
		};
	};

	this.makeDrop = function() {
		// For now, all possible types have an associated drop chance.
		// This is too simplistic and needs to be fleshed out, but could work for testing.
		var possibleTypes = {
			'basic': 0.15
		};

		var rand = Math.random();
		if (rand < possibleTypes[this.type]) {
			return world.getItem();
		} else {
			return false;
		}
	};

	this.updateCoords = function(x, y) {
		this.x = x;
		this.y = y;
		this.updateBlockCoords();
	};
};

var Player = function() {
	this.numExplosives = 20;
	this.loot = [];

	// Show or hide the player's inventory.
	this.toggleInventory = function() {
		// Implement
	};
};

var Display = function(parent, world) {

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
		})
		this.wrap.appendChild(this.game);
		this.wrap = parent.appendChild(this.wrap);
	};

	this.drawFrame = function() {
		// Implement
	};

	this.drawBackground = function(backgroundLayer) {
		this.wrap.appendChild(backgroundLayer);
		// create an element and save it as this.backgroundLayer
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

	this.removeActors = function() {
		// Remove actors
		// I'm thinking Display should take a World because then the Display can operate on a generic World.
	};
};

var main = function(world) {
	var display = new Display(document.body, world);
	var player = new Player();
	world.init(display, player);
};