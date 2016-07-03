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
			return this;
		};

		this.render = function() {
			this.display.drawLayer('background', this.createBackgroundLayer());
		}

		this.destroy = function() {
			this.display.destroy(['background']);
		}

		this.createBackgroundLayer = function() {
			return DOM.create('div', 'city-bg');
		}
	};
});