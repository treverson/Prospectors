'use strict';

define(function() {
	return function(city) {
		this.numExplosives = 200;
		this.loot = {};
		this.city = city;

		this.init = function() {
			// TODO: ??
		};

		this.addLoot = function(item) {
			if (this.loot[item]) {
				this.loot[item] += 1;
			} else {
				this.loot[item] = 1;
			}
		};
	};
});
