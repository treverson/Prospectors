define(function() {

	var createMany = function(elements) {
		/*
			element: {
				property: value,
				property: value,
				...
				children: [
					{
						element: {
							// etc.
						}
					},
					...
				]
			}
		*/
		var e;
		for (var k in elements) {
			e = document.createElement(k);
			for (var k2 in elements[k]) {
				if (k2 !== 'children') {
					e[k2] = elements[k][k2];
				} else {
					elements[k][k2].forEach(function(el) {
						e.appendChild(createMany(el));
					});
				}
			}
		}
		return e;
	};

	return {
		// Create a new DOM element.
		create: function (name, className) {
			var elt = document.createElement(name);
			if (className) {
				elt.className = className; // String
			}
			return elt;	
		},

		style: function(el, styles) {
			for (var k in styles) {
				el.style[k] = styles[k];
			}
		},

		createMany: createMany
	};
});