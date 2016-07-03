'use strict';
/*
The world takes a view and renders it, swapping out the old view.
There is an overlay layer & a view layer
*/

define(['display', 'player', 'overlay'], function(Display, Player, Overlay) {
	return function(v) {
		var config = {
			blockSize: 30
		};
		var display = new Display();
		var player = new Player();
		var view = new v(display, player, config);
		var overlay = new Overlay(display, player);

		// init -> create overlay, draw view, save view state.
		this.init = function() {
			view.init().render();
			overlay.render();
		};

		// swapView -> take view, replace old view with new one.
		this.swapView = function(newView) {

		};
	};
});