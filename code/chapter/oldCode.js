
function Vector(x, y) {
	this.x = x;
	this.y = y;

	this.plus = function(other) {
		return new Vector(this.x + other.x, this.y + other.y);
	};

	this.times = function(factor) {
		return new Vector(this.x * factor, this.y * factor);
	};

	this.distance = function(v) {
		return Math.sqrt(Math.pow((this.x - v.x), 2) + Math.pow((this.y - v.y), 2));
	};
}

function Level(level, player) {
	this.width = WIDTH;
	this.height = HEIGHT;
	this.padding = 8;
	this.grid = [];
	this.actors = [player];
	this.numCats = 1;
	this.stage = 0;
	this.player = player;

	this.makeEnemies = function() {
		for (var i = 0; i < this.numCats + this.stage; i++) {
			var side1, pos1, side2, pos2, x, y;
			var valid = false;
			while (!valid) {
				side1 = Math.floor(Math.random() * 2); // 0 is left, 1 is right.
				pos1 = Math.ceil(Math.random() * (this.padding - 1));
				side2 = Math.floor(Math.random() * 2); // 0 is left, 1 is right.
				pos2 = Math.ceil(Math.random() * (this.padding - 1));

				x = makePosPadding(this, pos1, side1);
				y = makePosPadding(this, pos2, side2);

				if (Obstacles.indexOf(this.grid[x][y]) < 0) {
					valid = true;
				}
			}
			this.actors.push(new Enemy(new Vector(x,y)));
			this.grid[x][y] = 'enemy';
		}
	};

	this.lifeLost = function() {
		this.player.lives -= 1;
		if (!this.player.lives) {
			this.status = 'lost';
		} else {
			this.swap(this.player.pos, CENTER);
			this.player.pos = new Vector(CENTER.x, CENTER.y);
		}

	};

	this.move = function(toSwap, endPoint) {
		var end = this.grid[endPoint.x][endPoint.y];
		switch (end) {
			case 'empty':
				this.swap(toSwap, endPoint);
				this.swap(this.player.pos, toSwap);
				this.player.pos = toSwap;
				break;
			case 'sink':
				this.grid[toSwap.x][toSwap.y] = 'empty';
				this.swap(this.player.pos, toSwap);
				this.player.pos = toSwap;
			default:
				break;
		}
	};

	this.tryMove = function(d) {
		var v = null;
		switch (d) {
			case 'left':
				v = new Vector(0, -1);
				break;
			case 'right':
				v = new Vector(0, 1);
				break;
			case 'up':
				v = new Vector(-1, 0);
				break;
			default: // down
				v = new Vector(1, 0);
				break;
		}

		var posIter = this.player.pos.plus(v);
		var toSwap = posIter;
		while (true) {
			var square = this.grid[posIter.x][posIter.y];
			if (square === 'block') {
				posIter = posIter.plus(v);
			} else if (square === 'cat' || square === 'block') {
				break;
			} else {
				this.move(toSwap, posIter);
				break;
			}
		}

	};

	this.isFinished = function() {
		if (!this.player.lives) {
			return true;
		}

		var done = true;
		this.actors.forEach(function(a) {
			if (a.type === 'enemy') {
				if (a.state === 'alive') {
					done = false;
				}
			}
		});
		if (done) {
			this.status = 'complete';
			this.player.score += (10 * (this.numCats + this.stage));
			this.stage += 1;
			this.actors.forEach(function(a) {
				if (a.type === 'enemy') {
					a.state = 'dead';
				}
			});
		}
		return done;
	};

	this.swap = function(v1, v2) {
		var l1 = this.grid[v1.x][v1.y];
		this.grid[v1.x][v1.y] = this.grid[v2.x][v2.y];
		this.grid[v2.x][v2.y] = l1;
	};

	// this.makeNewActor = function(type) {
	// 	return new Obstacles[type]();
	// };

	var calcChances = function(t) {
		for (var i in t.chances) {
			var r = Math.random();
			if (r < t.chances[i]) {
				return i;
			}
		}
		return 'empty';
	};

	var makePosPadding = function(l, p, s) {
		return p + (s * ((l.width - 2) - l.padding));
	};

	// The chance that any particular empty square will be one of these obstacles. 
	this.chances = {
		wall: 0.025 * (level % 3), // 0, 2.5%, 5%.
		sink: level > 2 ? (0.05 * (level % 2)) + 0.025 : 0, // after level 3: 2.5%, 7.5%
		yarn: 0 // Need to figure out the mechanics here.
	};

	for (var y = 0; y < this.height; y++) {
		var gridLine = [];
		for (var x = 0; x < this.width; x++) {
			var fieldType = null;
			if (y === 0 || y === (this.height - 1) || x === 0 || x === (this.width - 1)) {
				fieldType = 'wall';
			} else if (y < this.padding || x < this.padding || x > (this.width - this.padding - 1) || y > (this.height - this.padding - 1)) {
				fieldType = calcChances(this);
				if (fieldType !== 'empty') {
					//this.actors.push(this.makeNewActor(fieldType));
				}
			} else if (x === CENTER.x && y === CENTER.y) {
				fieldType = 'player';
				this.player.pos = new Vector(x, y);
			} else {
				fieldType = 'block';
			}
			gridLine.push(fieldType);
		}
		this.grid.push(gridLine);
	}

	this.makeEnemies();
	this.status = this.finishDelay = null;
}

function Player(pos) {
	this.pos = pos;
	this.lives = 3;
	this.keyDelay = 75;
	this.score = 0;
	this.lastMoved = Date.now();
	this.type = 'player';

	this.act = function(level, keys) {
		var thisTime = Date.now();
		if ((thisTime - this.lastMoved) > this.keyDelay) {
			for (var d in keys) {
				if(keys[d]) {
					level.tryMove(d);
					break;
				}
			}
			this.lastMoved = thisTime;
		}
	};
}

function findEmptySquare(grid, pos, playerPos, canSlide) {
	var moves = [];

	moves.push(new Vector(pos.x + 1, pos.y));
	moves.push(new Vector(pos.x - 1, pos.y));
	moves.push(new Vector(pos.x, pos.y + 1));
	moves.push(new Vector(pos.x, pos.y - 1));

	if (canSlide) {
		moves.push(new Vector(pos.x + 1, pos.y + 1));
		moves.push(new Vector(pos.x + 1, pos.y - 1));
		moves.push(new Vector(pos.x - 1, pos.y + 1));
		moves.push(new Vector(pos.x - 1, pos.y - 1));
	}

	moves.sort(function(a,b) {
		return playerPos.distance(a) - playerPos.distance(b);
	});

	while (moves.length) {
		var p = moves.shift();
		if (grid[p.x][p.y] && Obstacles.indexOf(grid[p.x][p.y]) < 0) {
			return p;
		}
	}
	return false;
}

function Enemy(pos) {
	this.pos = pos;
	this.state = 'alive';
	this.type = 'enemy';
	this.speed = 500;
	this.lastMoved = Date.now();
	this.act = function(level) {
		var thisTime = Date.now();
		if ((thisTime - this.lastMoved) > this.speed) {
			var v = findEmptySquare(level.grid, this.pos, level.player.pos, true);
			if (!v) {
				this.state = 'trap';
			} else {
				this.state = 'alive';
				if(v.x === level.player.pos.x && v.y === level.player.pos.y) {
					level.lifeLost();
				}
				level.swap(v, this.pos);
				this.pos = v;
			}
			this.lastMoved = thisTime;
		}
	};
}

function elt(name, className) {
	var elt = document.createElement(name);
	if (className) elt.className = className;
	return elt;
}

function DOMDisplay(parent, level) {
	this.wrap = parent.appendChild(elt('div', 'game'));
	this.level = level;
	this.livesLeft = this.level.player.lives;

	this.panel = this.wrap.appendChild(this.drawPanel());
	this.backgroundLayer = this.drawBackground();
	this.wrap.appendChild(this.backgroundLayer);
	this.drawFrame();
}

DOMDisplay.prototype.drawPanel = function() {
	var wrap = elt('div', 'panel');
	this.score = wrap.appendChild(this.drawScore());
	this.lives = wrap.appendChild(this.drawLives());
	return wrap;
}

var scale = 25;

DOMDisplay.prototype.drawBackground = function() {
	var table = elt('table', 'background');
	table.style.width = this.level.width * scale + 'px';
	this.level.grid.forEach(function(row) {
		var rowElt = table.appendChild(elt('tr'));
		rowElt.style.height = scale + 'px';
		row.forEach(function(type) {
			rowElt.appendChild(elt('td', type));
		});
	});
	return table;
};

DOMDisplay.prototype.drawScore = function() {
	var wrap = elt('div', 'score');
	var inner = elt('div', '');
	inner.innerHTML = this.level.player.score.toString();
	wrap.appendChild(inner);
	return wrap;
};

DOMDisplay.prototype.clearScore = function() {
	this.panel.removeChild(this.score);
};

DOMDisplay.prototype.drawLives = function() {
	var wrap = elt('div', 'lives');
	for (var i = 0; i < this.level.player.lives - 1; i++) {
		var rect = wrap.appendChild(elt('div', 'actor player'));
		rect.style.width = scale + 'px';
		rect.style.height = scale + 'px';
		rect.style.left = i * scale + 'px';
	}
	return wrap;
};

DOMDisplay.prototype.clearLives = function() {
	this.panel.removeChild(this.lives);
};

// So the actors layer is on top of the background layer.
// This, I suppose, reduces the amount of work we have to do.
// So walls == obstacles, blocks == actors?
// Let's use a different paradigm: shift/swap blocks, ignore actor layer.
DOMDisplay.prototype.drawFrame = function() {
	this.removeBackground();
	this.backgroundLayer = this.wrap.appendChild(this.drawBackground());
	this.score.innerHTML = this.level.player.score.toString();
	if (this.livesLeft > this.level.player.lives) {
		this.removeLife();
		this.livesLeft = this.level.player.lives;
	}
	this.wrap.className = 'game ' + (this.level.status || '');
	// this.scrollPlayerIntoView();
};

DOMDisplay.prototype.removeLife = function() {
	var elements = this.lives.getElementsByTagName('div');
	if (elements.length) {
		this.lives.removeChild(elements[0]);
	}
};

DOMDisplay.prototype.removeBackground = function() {
	this.wrap.removeChild(this.backgroundLayer);
};

DOMDisplay.prototype.clear = function() {
	this.wrap.parentNode.removeChild(this.wrap);
};

DOMDisplay.prototype.gameOver = function() {
	this.gameOverOuter = elt('div', 'gameOverOuter');
	var gameOverInner = elt('div', 'gameOverInner');
	gameOverInner.innerHTML = 'Game Over';
	this.gameOverOuter.appendChild(gameOverInner);
	this.wrap.appendChild(this.gameOverOuter);
};

Level.prototype.obstacleAt = function(pos) {
	var xStart = Math.floor(pos.x);
	var xEnd = Math.ceil(pos.x);
	var yStart = Math.floor(pos.y);
	var yEnd = Math.ceil(pos.y);

	if (xStart < 0 || xEnd > this.width || yStart < 0) {
		return 'wall';
	}
	if (yEnd > this.height) {
		return 'lava';
	}
	for (var y = yStart; y < yEnd; y++) {
		for (var x = xStart; x < xEnd; x++) {
			var fieldType = this.grid[y][x];
			if (fieldType) return fieldType;
		}
	}
};

var stepDuration = 0.05;

Level.prototype.animate = function(level, step, keys) {
	if (this.status != null) {
		this.finishDelay -= step;
	}
	while (step > 0) {
		this.actors.forEach(function(actor) {
			actor.act(level, keys);
		}, this);
		step -= stepDuration;
	}
};

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

function runAnimation(frameFunc) {
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
}

var arrows = trackKeys(arrowCodes);

function runLevel(level, Display, andThen) {
	var display = new Display(document.body, level);
	runAnimation(function(step) {
		level.animate(level, step, arrows);
		display.drawFrame();
		if (level.isFinished()) {
			if (level.stage < STAGES && level.player.lives > 0) {
				level.makeEnemies();
			} else {
				if (level.status === 'lost') {
					display.gameOver();
				} else {
					display.clear();
					andThen(level.status);
				}
				return false;
			}
		}
	});
}

function runGame(Display) {
	var player = new Player(new Vector(CENTER.x, CENTER.y));
	function startLevel(n, p) {
		runLevel(new Level(n, p), Display, function(status) {
			startLevel(n + 1, p);
		});
	}
	startLevel(0, player);
}