/* Main function to run */
define(['prospectors', 'world'], function(Prospectors, World) {
	return function() {
		var view = Prospectors;
		var world = new World();
		world.init();
	};
});