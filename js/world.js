'use strict';
/*
The world takes a view and renders it, swapping out the old view.
There is an overlay layer & a view layer
*/

var World = function(v) {
	var display = new Display(); // Ideally we won't need to pass view to display, I think. Need to refactor.
	var player = new Player();
	var view = new v(display, player);
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