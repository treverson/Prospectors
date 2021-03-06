/*
Inventory Module

Requirements:
- The goal here is to create a JS function that takes a player and creates that player's inventory.
- The inventory should have ~20 spaces or so, perhaps as an array of items.
	- Items will have different properties (e.g. only certain items should be stackable, such as blast powder from prospectors.js)
	- So, Item objects/classes/functions will need to be created as well.
- It will have various "states" (e.g. full/not full, open/closed, etc);
- Should have some sort of "create" method to build it on a page (see prospectors.js for that)
	- Player should be able to drag items, rearrange them, drop/destroy them, craft them (e.g. 20 blast powder into dynamite), etc.
	- This implies that there should be a menu or menu buttons that open menus.
		- This could be tricky, especially since we haven't planned everything yet.
			- The goal here should be to create something that can be generalized and reused/modified (like a menu function/class)
	- There should also be enable/disable states for these actions, when we do/don't want the player to be able to do them.
- The inventory will be controlled by the various states in which it exists (e.g. the prospectors game).
	- So, the inventory should be a collection of methods that can be called from outside the function.
- General guidelines:
	- Have your functions Do One Thing (DOT)
	- Keep It Simple, Stupid
	- Minimize side effects! That is, functions shouldn't mess up things outside the scope of the function.
		- This is very similar to DOT
	- This is a big project, but take it one step at a time and you'll get it :)
*/

define(['dom'], function(DOM) {
	return function(display, player) {
		// Requires implementation...

		// TODO: Need "render" function (see overlay.js)
		this.render = function() {
			this.mainEl = DOM.create('div', 'inventory-overlay clickable');
			this.tab = DOM.create('div', 'clickable tab');

			//for(i = 0; i < 5; i++){		//create rows
			//	this.row = DOM.create('div', 'row');
			//	for(i = 0; i < 3; i++){		//create columns
			//		this.row.appendChild(DOM.create('div' 'col-sm-4'));
			//	}
			//	this.mainEl.appendChild(this.row);
			//}

			this.mainEl.appendChild(this.tab);
			display.drawLayer('wrap', this.mainEl);
			this.openState = false;
			this.fullState = false;

			this.tab.onclick = function(){	//open and close inventory onclick
				if (this.openState) {
					this.close();
				} else {
					this.open();
				}
			}.bind(this);

		};


		this.open = function() {	//open inventory
			DOM.style(this.mainEl, {
				right: '-500px'
			});
			this.openState = true;
		};

		this.close = function() {	//close inventory
			DOM.style(this.mainEl, {
				right: '-800px'
			});
			this.openState = false;
		};

		this.checkFull = function() {
			if (items.length >= 20) {		//check to see if inventory is full
				this.fullState = true;
			} else {
				this.fullState = false;
			}

		};

		

	};



	
});