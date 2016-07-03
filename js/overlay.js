'use strict';
/* Overlay */

define(['inventory', 'menu'], function(Inventory, Menu) {
	return function(display, player) {

		// Components of the overlay.
		var components = [
			Inventory,
			Menu
		].map(function(component) {
			return new component(display, player);
		});

		this.render = function() {
			components.forEach(function(component) {
				component.render();
			});
		};
	};
});