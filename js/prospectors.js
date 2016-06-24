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

Implementation notes:
	- Initialize:
		- Background
		- Initial actor state
		- Event listeners
	- Step takes current time and user input and adjust actors accordingly.
	- DON'T WORRY ABOUT PERFECTION
		* The goal is to create a working model, not a final product!

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

var Items = {
	// Items will eventually be passed in from outside the game (from the universe).
	items: {
		blastPowder: {
			mult: 200
		},
		coin: {
			mult: 100
		},
		quartz: {
			mult: 30
		},
		metalScraps: {
			mult: 140
		}
	}
};

var Utils = {
	printCoords: function(x, y) {
		return '(' + x + ', ' + y + ')';
	},
	sortByY: function(a, b) {
		if (a.y < b.y) {
			return 1;
		} else if (a.y === b.y) {
			return 0;
		} else {
			return -1;
		}
	},
	pushByY: function(arr, coords) {
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].y < coords.y) {
				arr.splice(i, 0, coords);
				return;
			}
		}
		arr.push(coords);
	},
	getValByWeights: function(data, weightProp, valProp) {
		var rand = Math.random();
		var multTotal = 0;
		for (var i in data) {
			multTotal += data[i][weightProp];
		}
		var inverseMultTotal = 1 / multTotal; // Inverse to create ratios with.
		var runningTotal = 0; // Keep track of previous work.
		for (var i in data) {
			runningTotal += data[i][weightProp];
			if (rand < (runningTotal * inverseMultTotal)) {
				// Either return the desired value or the name of the winning property.
				return valProp ? data[i][valProp] : i;
			}
		}

		throw "Could not choose a " + weightProp + " in " + data + "!";
	},
	join: function(objA, objB) {
		for (var i in objB) {
			objA[i] = objB[i];
		}
	},
	rand: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;	
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

var Prospectors = function() {
	this.init = function(display, player) {

		// Send elements to Display to draw.
		this.display = display;

		this.player = player;

		// The state of the game. Options include:
		// 'ready'		--> Player may place dynamite on the map.
		// 'acting'		--> Animation is occurring (actors are acting).
		this.state = 'ready';

		// The keys we care about. These are examples at the moment.
		this.keyCodes = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' };

		// Things to be destroyed in order.
		this.destroyQueue = [];

		// The positions of all the actors
		this.actors;

		// Game size variables.
		// width & height refer to number of blocks
		this.width = 15;
		this.height = 15;
		// scale refers to size of block in pixels.
		this.scale = 30;

		// Variables for randomly placing explosives
		this.randomSeedNum = 5;
		this.maxExplosives = Math.floor(this.width * this.height * .15);

		// Initializes our this.actors
		this.createActors();

		// Initialize display.
		this.display.init();

		// Draw initial frame
		this.display.drawBackground(this.createBackgroundLayer());
		this.display.drawActors(this.actors);
	};

	this.animateDrop = function(x, y, item) {
		this.display.animateDrop((x * this.scale), (y * this.scale), item, 0, 0);
	};

	this.getItem = function() {
		return Utils.getValByWeights(Items.items, 'mult');
	};

	this.prepForDestroy = function(x, y, callback) {
		if (this.destroyQueue.length < this.maxExplosives) {
			this.destroyQueue.push({ x: x, y: y });
			if (callback) {
				callback();
			}
		}
	};

	this.restoreFromDestroy = function(x, y, callback) {
		for (var i = 0; i < this.destroyQueue.length; i++) {
			if (this.destroyQueue[i].x === x && this.destroyQueue[i].y === y) {
				this.destroyQueue.splice(i, 1);
				break;
			}
		}
		if (callback) {
			callback();
		}
	};

	this.weakenNeighbors = function(x, y) {
		var nX, nY;
		// Iterate through neighboring blocks and weaken them.
		[
			[-1, 0],
			[1, 0],
			[0, 1]
		].forEach(function(pair) {
			nX = x + pair[0];
			nY = y + pair[1];
			if (this.actors[nX] && this.actors[nX][nY]) {
				this.actors[nX][nY].weaken(this.actors[x][y].weight);
			}
		}.bind(this));
	};

	this.doPlay = function() {
		this.state = 'acting';
		this.destroyQueue.sort(Utils.sortByY); // Is this the best way?
		var callback = function() {
			doExplodes()
		};

		var doExplodes = function() {
			if (this.destroyQueue.length) {
				var a = this.destroyQueue.pop();
				this.weakenNeighbors(a.x, a.y);
				this.actors[a.x][a.y].explode(callback);
			} else {
				this.state = 'ready';
			}
		}.bind(this);

		doExplodes();
	};

	this.randomlyMark = function() {
		var randomBlocks = {},
			nCoords,
			k;

		// Add random blocks until we have the correct amount (without going over limit)
		while (Object.keys(randomBlocks).length < this.randomSeedNum && this.destroyQueue.length < this.maxExplosives) {
			nCoords = {
				x: Math.floor(Math.random() * this.width),
				y: Math.floor(Math.random() * this.height)
			};
			k = nCoords.x + '-' + nCoords.y;
			randomBlocks[k] = nCoords;
		}

		for (var i in randomBlocks) {
			this.actors[randomBlocks[i].x][randomBlocks[i].y].mark();
		}
	};

	this.doRandSeed = function() {
		if (this.state === 'ready') {
			this.randomlyMark();
		}
	};

	this.createBackgroundLayer = function() {
		// Create menu
		var menu = DOM.create('div', 'menu');
		// Create play button
		var play = DOM.create('button', 'clickable button norm-play');
		play.innerHTML = 'PLAY';
		// Play onclick function (bind this)
		play.onclick = function() {
			this.doPlay();
		}.bind(this);

		// Create "random seed" button
		var randomSeedWrapper = DOM.create('div', 'rand-play-wrapper');
		var randomSeed = DOM.create('button', 'clickable button rand-play');
		randomSeed.innerHTML = 'RANDOM SEED';
		// randomSeed onclick function (bind this)
		randomSeed.onclick = function() {
			this.doRandSeed();
		}.bind(this);

		// Display randomSeedNum
		var randomSeedNumEl = DOM.create('div', 'rand-play-num');
		randomSeedNumEl.innerHTML = this.randomSeedNum.toString();

		// Increment randomSeedNum button
		var upTriangle = DOM.create('a', 'clickable button up-triangle');
		upTriangle.onclick = function() {
			if (this.randomSeedNum < this.player.numExplosives && this.randomSeedNum < this.maxExplosives) {
				this.randomSeedNum += 1;
				document.getElementsByClassName('rand-play-num')[0].innerHTML = this.randomSeedNum.toString();
			}
		}.bind(this);

		// Decrement randomSeedNum button
		var downTriangle = DOM.create('a', 'clickable button down-triangle');
		downTriangle.onclick = function() {
			if (this.randomSeedNum > 1) {
				this.randomSeedNum -= 1;
				document.getElementsByClassName('rand-play-num')[0].innerHTML = this.randomSeedNum.toString();
			}
		}.bind(this);

		// Container for increment/decrement buttons
		var triangleContainer = DOM.create('div', 'triangle-container');
		triangleContainer.appendChild(upTriangle);
		triangleContainer.appendChild(downTriangle);

		var randomSeedNumContainer = DOM.create('div', 'rand-play-num-container');
		randomSeedNumContainer.appendChild(randomSeedNumEl);
		randomSeedNumContainer.appendChild(triangleContainer);

		randomSeedWrapper.appendChild(randomSeed);
		randomSeedWrapper.appendChild(randomSeedNumContainer);

		menu.appendChild(play);
		menu.appendChild(randomSeedWrapper);
		DOM.style(menu, {
			width: (this.scale * this.width) + 'px'
		});
		return menu;
	};

	this.createActors = function() {
		this.actors = [];
		for(var i = 0; i < this.width; i++) {
			var actorGridRow = [];
			for(var j = 0; j < this.height; j++) {
				actorGridRow.push(new Block(this, i, j));
			}
			this.actors.push(actorGridRow);
		}
	};

	this.swap = function(start, end) {
		this.actors[start.x][start.y].updateCoords(end.x, end.y);
		this.actors[end.x][end.y].updateCoords(start.x, start.y);

		var t = this.actors[start.x][start.y];
		this.actors[start.x][start.y] = this.actors[end.x][end.y];
		this.actors[end.x][end.y] = t;
	};

	this.shift = function(start, end) {
		this.actors[start.x][start.y].updateCoords(end.x, end.y);
		this.actors[end.x][end.y] = this.actors[start.x][start.y];
	};

	this.dropBlocksTo = function(x, y, callback) {
		// Drop every block above this y down a position.
		// Reduce integrity of base
		var start, end;
		for(var j = y-1; j >= 0; j--) {
			start = { x: x, y: j };
			end = { x: x, y: j + 1 };
			this.swap(start, end);
		}
		// Drop in the block that was destroyed.
		var dropBlock = function (block) {
			setTimeout(block.fallIn(block, callback), 0);
		}(this.actors[x][0]);
	};
};

var BlockConfig = {
	blocks: {
		basic: {
			weight: 35,
			integrity: 120,
			dropChance: 0.1,
			appearanceVal: 100,
			styles: {
				backgroundColor: 'rgba(163, 173, 184, 1)'
			}
		},
		granite: {
			weight: 60,
			integrity: 250,
			dropChance: 0.4,
			appearanceVal: 15,
			styles: {
				backgroundColor: 'rgba(78, 97, 114, 1)'
			}
		}
	},
	chooseNewType: function() {
		return Utils.getValByWeights(BlockConfig.blocks, 'appearanceVal');
	}
};

var Block = function(world, x, y, type) {
	this.world = world;
	this.x = x;
	this.y = y;
	this.type = type || BlockConfig.chooseNewType();
	this.integrity = BlockConfig.blocks[this.type].integrity;
	this.weight = BlockConfig.blocks[this.type].weight;
	this.marked = false;
	this.buildBlockEl = function() {
		var classes = [
			'block',
			'clickable',
			this.type,
			'integrity-' + Math.floor(this.integrity).toString()
		];
		var el = DOM.create('div', classes.join(' '));
		var styles = {
			width: world.scale + 'px',
			height: world.scale + 'px',
			left: this.x * world.scale + 'px',
			top: this.y * world.scale + 'px'
		};
		Utils.join(styles, BlockConfig.blocks[this.type].styles);
		DOM.style(el, styles);
		el.onclick = function() {
			if (this.world.state === 'ready') {
				if (!this.marked) {
					this.mark();
				} else {
					this.unmark();
				}
			}
		}.bind(this);

		return el;
	};

	this.blockEl = this.buildBlockEl();

	this.weaken = function(w) {
		this.integrity -= w;
		DOM.style(this.blockEl, {
			opacity: (this.integrity / BlockConfig.blocks[this.type].integrity).toString()
		});
		if (this.integrity <= 0) {
			this.world.prepForDestroy(this.x, this.y);
		}
	};

	this.mark = function() {
		// console.log('mark ' + Utils.printCoords(this.x, this.y));
		this.world.prepForDestroy(this.x, this.y, function() {
			this.marked = true;
			DOM.style(this.blockEl, {
				backgroundImage: 'url("image/dynamite.png")',
				boxShadow: 'inset 0 0 0 1px rgba(143,59,27,0.9),inset 0 2px 5px rgba(143,59,27,0.8)'
			});
		}.bind(this));
	};

	this.unmark = function() {
		// console.log('unmark ' + Utils.printCoords(this.x, this.y));
		this.world.restoreFromDestroy(this.x, this.y, function() {
			this.marked = false;
			DOM.style(this.blockEl, {
				backgroundImage: 'none',
				boxShadow: 'inset 0 0 2px 0px #27496d'
			});
		}.bind(this));
	};

	this.updateBlockCoords = function() {
		DOM.style(this.blockEl, {
			left: (world.scale * this.x) + 'px',
			top: (world.scale * this.y) + 'px'
		});
	};

	this.explode = function(callback) {
		var drop = this.makeDrop();
		//console.log("LOOT: " + drop);
		if (drop) {
			world.animateDrop(this.x, this.y, drop);
			this.world.player.addLoot(drop);
		}
		this.hideBlock();
		
		// As elsewhere, this is just for effect.
		// Better: Create a "wrapperFunc"-building function!
		// Would somehow need to take the arguments and include them in scope.
		var wrapperFunc = function(x, y) {
			setTimeout(function() {
				world.dropBlocksTo(x, y, callback);
			}, 50);
		}(this.x, this.y);
	};

	this.hideBlock = function() {
		DOM.style(this.blockEl, {
			display: 'none'
		});
		this.integrity = BlockConfig.blocks[this.type].integrity;
		this.type = 'empty';
		this.unmark();
	};

	this.showBlock = function() {
		this.type = BlockConfig.chooseNewType();
		var styles = {
			display: 'block',
			opacity: this.integrity.toString()
		};
		Utils.join(styles, BlockConfig.blocks[this.type].styles);
		DOM.style(this.blockEl, styles);
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
		var rand = Math.random();
		if (rand < BlockConfig.blocks[this.type].dropChance) {
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

var Player = function(rootEl) {
	this.numExplosives = 200;
	this.loot = {};

	this.init = function() {
		this.createOverlay();
	};

	// Show or hide the player's inventory.
	this.toggleInventory = function() {
		// Implement
	};

	// Create inventory overlay.
	this.createOverlay = function() {
		this.overlay = DOM.create('div', 'inventory-overlay clickable');
		rootEl.appendChild(this.overlay);
	}

	this.addLoot = function(item) {
		if (this.loot[item]) {
			this.loot[item] += 1;
		} else {
			this.loot[item] = 1;
		}
	};

	this.init();
};


var Item = function() {
	var itemWidth = 0.8;

	this.init = function(x, y, name, scale) {
		this.x = x;
		this.y = y;
		this.name = name;
		this.itemEl = DOM.create('div', 'item');
		this.scale = scale;
		
		DOM.style(this.itemEl, {
			backgroundImage: 'url("image/' + this.name + '.png")',
			left: this.x + 'px',
			top: this.y + 'px',
			margin: (scale - (scale * itemWidth))/2 + 'px',
			width: (scale * itemWidth) + 'px',
			height: (scale * itemWidth) + 'px'
		});
	};

	this.sendToDestination = function(dx, dy) {
		var callback = function() {
			DOM.style(this.itemEl, {
				display: 'none'
			});
		};

		setTimeout(function() {
			var amt = (this.scale * 1.5);
			DOM.style(this.itemEl, {
				top: (this.y - amt/4) + 'px',
				left: (this.x - amt/4) + 'px',
				width:  amt + 'px',
				height: amt + 'px'
			});
			setTimeout(callback.bind(this), 500);
		}.bind(this), 100);
	};
}

/*
Try to generalize this function so that we can 
have multiple displays with different behavior
(e.g. a Player display and a Game display).
*/
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

	this.drawBackground = function(backgroundLayer) {
		this.wrap.appendChild(backgroundLayer);
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

var main = function(world) {
	var display = new Display(document.body, world);
	var player = new Player(document.body);
	world.init(display, player);
};