'use strict';
/*
The world takes a view and renders it, swapping out the old view.
There is an overlay layer & a view layer
*/

define(['display', 'player', 'overlay', 'city'], function(Display, Player, Overlay, City) {
	return function(v) {
		var view, display, player, overlay;
		var config = {
			blockSize: 30
		};

		// init -> create overlay, draw view, save view state.
		this.init = function() {
			display = new Display();
			if (v) {
				view = new v(display, player, config);
			} else {
				view = new City(display, player, config);
			}
			player = new Player(view);
			overlay = new Overlay(display, player, view, this);
			view.init().render();
			overlay.render();
		};

		// swapView -> take view, replace old view with new one.
		this.swapView = function(newView) {
			// May need to send newView to overlay so menus can be updated?
			// If we are given a function, we need to instantiate it.
			view.destroy();
			if(typeof(newView) === 'function') {
				console.log('you are at city and want to switch to prospectors');
				view = new newView(display, player, config);
				overlay.view = view;
				view.init().render();
			} else {
				console.log('you are at prospectors and want to switch to city');
				view = newView;
				overlay.view = newView;
				view.render();
			}
		};

		this.getConfig = function() {
			return config;
		};
	};
});