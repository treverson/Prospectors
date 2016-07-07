define(['dom', 'prospectors'], function(DOM, Prospectors) {
	return function(display, player, world, parent) {
		this.parent = parent;
		this.world = world;
		this.display = display;
		this.player = player;
		this.render = function() {
			this.display.drawLayer('overlay', this.createMenu());
		};

		this.createMenu = function() {
			var menu = DOM.create('div', 'main-menu');
			var switchView = DOM.create('button', 'clickable button');
			switchView.innerHTML = 'Click Me';
			// randomSeed onclick function (bind this)
			switchView.onclick = function() {
				if (this.parent.getViewName() !== 'city') {
					this.world.swapView(this.player.city);
				} else {
					this.world.swapView(Prospectors);
				}
			}.bind(this);
			menu.appendChild(switchView);
			return menu;
		};

		this.updateMenu = function() {
			console.log('update');
		};
	};
});