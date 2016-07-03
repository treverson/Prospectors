'use strict';
/* Overlay */

define(['inventory', 'menu'], function(Inventory, Menu) {
	return function(display, player, view, world) {
		this.view = view;

		var methods = {
			getViewName: function() {
				return this.view.name;
			}.bind(this)
		};

		// Components of the overlay.
		var components = [
			Inventory,
			Menu
		].map(function(component) {
			return new component(display, player, world, methods);
		}.bind(this));

		this.render = function() {
			components.forEach(function(component) {
				component.render();
			});
		};
	};
});