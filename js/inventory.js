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

var Inventory = function(player) {
	// Requires implementation...
}