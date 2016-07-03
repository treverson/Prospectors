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

define(['utils', 'dom'], function(Utils, DOM) {
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

	var Prospectors = function(display, player, config) {
		this.name = 'prospectors';
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
		this.width = config.blocksWide || 15;
		this.height = config.blocksTall || 15;
		// scale refers to size of block in pixels.
		this.scale = config.blockSize || 30;

		// Variables for randomly placing explosives
		this.randomSeedNum = 5;
		this.maxExplosives = Math.floor(this.width * this.height * .15);

		this.init = function() {
			// Initializes our this.actors
			this.createActors();
			this.actorLayer = this.createActorLayer();
			this.backgroundLayer = this.createBackgroundLayer();
			this.toDraw = {
				view: this.createGameLayer(),
			};
			return this;
		};

		this.render = function() {
			// Draw initial frame
			for (var k in this.toDraw) {
				this.display.drawLayer(k, this.toDraw[k]);
			}
		};

		this.destroy = function() {
			this.display.destroy(Object.keys(this.toDraw));
		};

		this.createGameLayer = function() {
			var game = DOM.create('div', 'game');
			DOM.style(game, {
				width: (this.scale * this.width) + 'px',
				height: (this.scale * this.height) + 'px'
			});
			game.appendChild(this.backgroundLayer);
			game.appendChild(this.actorLayer);
			return game;
		};

		this.createBackgroundLayer = function() {
			var elements = {
				div: {
					className: 'menu', 
					children: [
						{ button: {
							className: 'clickable button norm-play',
							innerHTML: 'PLAY',
							onclick: function() {
								this.doPlay();
							}.bind(this)
						} },
						{ div: {
							className: 'rand-play-wrapper',
							children: [
								{ button: {
										className: 'clickable button rand-play',
										innerHTML: 'RANDOM SEED',
										onclick: function() {
											this.doRandSeed();
										}.bind(this)
									} },
								{ div: {
									className: 'rand-play-num-container',
									children: [
										{ div: {
											className: 'rand-play-num',
											innerHTML: this.randomSeedNum.toString()
										} },
										{ div: {
											className: 'triangle-container',
											children: [
												{ a: {
													className: 'clickable button up-triangle',
													onclick: function() {
														if (this.randomSeedNum < this.player.numExplosives && this.randomSeedNum < this.maxExplosives) {
															this.randomSeedNum += 1;
															document.getElementsByClassName('rand-play-num')[0].innerHTML = this.randomSeedNum.toString();
														}
													}.bind(this)
												} },
												{ a: {
													className: 'clickable button down-triangle',
													onclick: function() {
														if (this.randomSeedNum > 1) {
															this.randomSeedNum -= 1;
															document.getElementsByClassName('rand-play-num')[0].innerHTML = this.randomSeedNum.toString();
														}
													}.bind(this)
												} }
											]
										} }
									]
								} }
							]
						} }
					]
				}
			};

			return DOM.createMany(elements);
		};

		this.createActorLayer = function() {
			// Draw actors, save in this.actorLayer
			// The actorLayer, I guess, should be an element super-imposed on the backgroundLayer element.
			var actorLayer = DOM.create('div', 'actor-layer');
			for (var i = 0; i < this.width; i++) {
				for (var j = 0; j < this.height; j++) {
					actorLayer.appendChild(this.actors[i][j].blockEl);
				}
			}

			return actorLayer;
		};

		this.animateDrop = function(x, y, item) {
			var newItem = new Item((x * this.scale), (y * this.scale), item, this.scale);
			this.actorLayer.appendChild(newItem.itemEl);
			newItem.sendToDestination(0,0);
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

	// This is a specific item in the prospectors game.
	var Item = function(x, y, name, scale) {
		var itemWidth = 0.8; // Magic numbers not ideal...

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
	};

	return Prospectors;
});