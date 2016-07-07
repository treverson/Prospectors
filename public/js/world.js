'use strict';
/*
The world takes a view and renders it, swapping out the old view.
There is an overlay layer & a view layer
*/

define(['display', 'player', 'overlay', 'city'], function(Display, Player, Overlay, City) {
	return function(v) {
		var view, display, player, overlay, city;
		var config = {
			blockSize: 30
		};

		// init -> create overlay, draw view, save view state.
		this.init = function() {
			display = new Display();
			city = new City(display, player, config).init();
			player = new Player(city);
			if (v) {
				view = new v(display, player, config);
			} else {
				view = city;
			}
			
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
				view = new newView(display, player, config);
				overlay.view = view;
				view.init().render();
			} else {
				view = newView;
				overlay.view = view;
				view.render();
			}
		};

		this.getConfig = function() {
			return config;
		};
	};
});