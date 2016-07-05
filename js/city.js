'use strict';
/*
A City
*/

define(['dom'], function(DOM) {
	return function(display, player, config) {
		this.name = 'city';
		this.display = display;
		this.player = player;
		this.scale = config.blockSize || 30;
		/* 
			Grid of map tiles
			Tile:
				- Type: passable or impassable, interactive or dead
					- Door
						-passable, interactive
					- Wall
						- impassible, dead
					- Character
						- impassable, interactive
					-ground
						- passable, dead
			How to handle map view (for rendering)?
				- When reach the edge, reposition so player standing in center.
		*/
		this.init = function() {
			this.toDraw = {
				view: this.createViewLayer()
			}
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

		this.createViewLayer = function() {
			this.view = DOM.create('div', 'city-wrapper');
			this.view.appendChild(this.createBackgroundLayer());
			this.view.appendChild(this.createActorLayer());
			return this.view;
		};

		this.createBackgroundLayer = function() {
			this.backgroundLayer = DOM.create('div', 'city-bg');
			// ratio: 49w:25h
			var sizes = this.getSizes(); 
			DOM.style(this.backgroundLayer, {
				width: sizes.w + 'px',
				height: sizes.h + 'px'
			});
			return this.backgroundLayer;
		};

		this.getSizes = function() {
			var sizes = {
				w: 490,
				h: 250
			}
			// This needs to be adjusted to fit menus and other paddings!
			if (this.display.screen.w >= 1366) {
				// try 1225 x 625
				if (this.display.screen.h >= 625) {
					sizes.w = 1225;
					sizes.h = 625;
				} else {
					sizes.h = this.display.screen.h;
					sizes.w = (this.display.screen.h * 49) / 25;
				}
			} else if (this.display.screen.w >= 991) {
				// try 880 x 500
				if (this.display.screen.h >= 500) {
					sizes.w = 880;
					sizes.h = 500;
				} else {
					sizes.h = this.display.screen.h;
					sizes.w = (this.display.screen.h * 49) / 25;
				}
			}
			return sizes;
		};

		this.createActorLayer = function() {
			this.actorLayer = DOM.create('div', 'city-actor-layer');
			return this.actorLayer;
		};
	};
});