'use strict';
/*
A City
*/

define(['dom'], function(DOM) {
	return function(display, player, config) {
		this.display = display;
		this.player = player;
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
			console.log('init');
			return this;
		};

		this.render = function() {
			console.log('render');
		}
	};
});