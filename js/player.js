'use strict';

// We don't need rootEl here, refactor and put this createOverlay in Overlay
var Player = function() {
	this.numExplosives = 200;
	this.loot = {};

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
