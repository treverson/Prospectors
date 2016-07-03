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
			var bg = DOM.create('div', 'city-bg');
			DOM.style(bg, {
				width: '600px',
				height: '400px'
			});
			return bg;

		}
	};
});