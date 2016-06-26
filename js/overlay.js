'use strict';
/* Overlay */

var Overlay = function(display) {
	var components = [Inventory];
	components = components.map(function(component) {
		return new component();
	});

	this.render = function() {
		components.forEach(function(component) {
			component.render(display);
		});
	};
};