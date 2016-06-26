'use strict';
/* Overlay */

var Overlay = function(display, player) {
	
	// Components of the overlay.
	var components = [
		Inventory
	].map(function(component) {
		return new component(display, player);
	});

	this.render = function() {
		components.forEach(function(component) {
			component.render();
		});
	};
};