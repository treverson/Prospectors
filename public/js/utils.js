define(function() {
	return {
		printCoords: function(x, y) {
			return '(' + x + ', ' + y + ')';
		},
		sortByY: function(a, b) {
			if (a.y < b.y) {
				return 1;
			} else if (a.y === b.y) {
				return 0;
			} else {
				return -1;
			}
		},
		pushByY: function(arr, coords) {
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].y < coords.y) {
					arr.splice(i, 0, coords);
					return;
				}
			}
			arr.push(coords);
		},
		getValByWeights: function(data, weightProp, valProp) {
			var rand = Math.random();
			var multTotal = 0;
			for (var i in data) {
				multTotal += data[i][weightProp];
			}
			var inverseMultTotal = 1 / multTotal; // Inverse to create ratios with.
			var runningTotal = 0; // Keep track of previous work.
			for (var i in data) {
				runningTotal += data[i][weightProp];
				if (rand < (runningTotal * inverseMultTotal)) {
					// Either return the desired value or the name of the winning property.
					return valProp ? data[i][valProp] : i;
				}
			}

			throw "Could not choose a " + weightProp + " in " + data + "!";
		},
		join: function(objA, objB) {
			for (var i in objB) {
				objA[i] = objB[i];
			}
		},
		rand: function(min, max) {
			return Math.floor(Math.random() * (max - min + 1)) + min;	
		}
	};
});