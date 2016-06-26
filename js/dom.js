var DOM = {
	// Create a new DOM element.
	create: function (name, className) {
		var elt = document.createElement(name);
		if (className) {
			elt.className = className;
		}
		return elt;	
	},

	style: function(el, styles) {
		for (var k in styles) {
			el.style[k] = styles[k];
		}
	}
};
