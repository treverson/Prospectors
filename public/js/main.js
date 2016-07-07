/* Main function to run */
define(['prospectors', 'world', 'lib/phaser.min'], function(Prospectors, World, Phaser) {
	return function() {
		var view = Prospectors;
		var world = new World();
		world.init();

		// var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create });

  //       function preload () {

  //           game.load.image('border', '/image/border.png');

  //       }

  //       function create () {

  //           var border = game.add.sprite(game.world.centerX, game.world.centerY, 'border');
  //           border.anchor.setTo(0.5, 0.5);

  //       }
	};
});