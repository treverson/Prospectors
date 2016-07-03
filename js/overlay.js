'use strict';
/* Overlay */

define(['inventory', 'menu'], function(Inventory, Menu) {
	return function(display, player, view, world) {
		this.view = view;
		// Components of the overlay.
		var components = [
			Inventory,
			Menu
		].map(function(component) {
			return new component(display, player, world, {
				getViewName: function() {
					return this.view.name;
				}.bind(this)
			});
		}.bind(this));

		this.render = function() {
			components.forEach(function(component) {
				component.render();
			});
		};
	};
});