# Prospectors Readme
## Notes:

The idea of this game is to create an oldschool "Neopets meets Puzzle Pirates"-inspired world in which the user interface is primarily an animated JS game.
=======
Notes:

The idea of this game is to create an oldschool Neopets-inspired world in which the user interface is primarily an animated JS game.

Players have "pets" that they feed, clothe, house, and battle against each other.

Players play minigames to rack up George bucks (GB).

There is to be a strong emphasis on micro-rewards and random bonuses.

Players can spend real money to purchase in-game money.

Games yield loot & GB. Examples of loot are clothes, equipment, potions, food.
- Food increases pet physical & emotional stats
	- Happiness
	- Weight
	- Strength
	- Speed
	- Intelligence
	- Endurance
- Potions affect appearance (?)
- Equipment affect pet specialization.

What is specialization?

I would love to be able to create a notion of "real estate" in the game by creating cities in which players can own houses and shops.
Cities have a population and size cap (for the sake of memory as well as to create scarcity). Once it is reached, players have to either buy real estate from the current owners or go to a new city and purchase real estate there.

One idea is to have some sort of fountain in the middle of a city that randomly spawns loot. Also, maybe one arena per city? Need to think about how that would work.

Place bets on a grid
Tiles flip, alignments of tiles give rewards, winning tiles payout.
Given a 10 x 10 grid... how many and what sorts of combinations are necessary to create the correct odds?

Wild Western Settler themed? Manifest destiny (good name for the game lol)
	- Settle towns, create homesteads (????? what is this?), duel in the arena
	- More specific lore:
		- Settlers on an alien planet, or survivers from a post-apocalyptic disaster.
			* Basically the idea is low-tech finding high-tech stuff.
		- Players seek high-tech stuff and slowly settle (or re-settle) the planet.

### Minimum:
- Build a simple city
	- Player
	- Arena
		- Some sort of combat...
		- Have moves and equipment as well as individual stats.
		- Pokemon-style combat.
	- Game
		- Prospecters: Find loot (this is the slot-machine type game). <-- BUILD FOR MVP
			- Cursor is pickaxe, AND/OR there is a detonator button.
			- Place dynamite ($) on various blocks in the grid.
			- Explode dynamite. Blocks explode, falling blocks create chain reactions (e.g. some rocks crush others).
				- Maybe: harder rocks explode smaller area but have higher payout?
			- Exploded blocks sometimes reveal treasure.
			- Note: doesn't really create the "I almost got a jackpot" feeling because no "spinning".
			- Idea: Different stages of the game. E.g. a dynamite phase, then you find a vein of ore, then a pickaxe phase where you have a certain amount of time to click individual blocks (with a higher chance of payout) until the mine "collapses" or is exhausted. I LIKE IT!
				- Dynamite phase is where you spend money,
				- Pickaxe phase is instant gratification with no expenditure.
		- Gold panning?
		- Hunting game
		- Log-splitting game? The list of WW-themed games goes on...
		- Card games (blackjack, queens)
	- Market
		- Inventory is very limited, need to transport goods from city to city in caravans.
		- Can sign up to be on a caravan & get paid for your time. Play minigames intermittently on the way (some sort of combat).
			- There is definitely a way to make this not live but appear to be so...
			- Get paid based on amount of cargo that reaches the destination.
			- Can abort mission to not get paid.
			- During mission have to do a certain amount of random combats, based on the distance and number of other escorts.
			- Can also do other things
				* Repairs game
				* Hunting game
				* Cooking game
Okay, that should be good.

### Implementation:

1. World:
	- Takes a world (the current one), executes its "startWorld function" (runLevel in runGame)
	- Loop
		- Reads input
		- Passes input to UI layer
			- This figures out what the World wants to do with the input.
		- Passes input to the current World's "act" function.
			- This figures out what the World wants to do with the input.
		- Update World
		- Draw World
			- BackGround (static)
			- ForeGround (redrawn)
	- Definition:
		- startWorld: function
	- Examples
		- City
			- Player moves in an N x N grid.
			- Need to listen to live input.
			- Draw BG & FG.
		- Arena
			- Player chooses moves in UI.
			- No need to listen to any live input!
				* but we can, if we want to listen to arrow key presses.
			- Draw UI.
		- Market
			- Player interacts with UI
			- No need to listen to any live input!
				* but we can, if we want to listen to arrow key presses.
			- Draw UI.
		- Games
		- Map
			- IDK.
			- Don't need for just 1 city.


### Things for Sally to Do (slash long-term plans)
- Animations/designs
	- LOW priority
	- make blocks explode
	- give blocks "shapes" with CSS
- Create some sort of inventory
	- given a player with some array of objects representing items, display all the items in a grid and be able to rearrange, hover/click for details, and equip them.
	- Inventory should be small
	- May be difficult to do
- Create the city/world to move around in
	- 2D grid of tiles. Player occupies one of those tiles.
	- City is one map, world is a larger map.
		- Not really sure about the purpose of the "world" yet, or how exactly it will work. Don't do it yet!
		- City is high-priority.
			-Accessible points in the city include
				* Fountain/free thing
				* Mines (for prospecting)
				* Arena
				* Auction house
				* Stores and player houses
					- Both stores and player houses occupy "real estate"-- there can only be so many!
					- Players can go inside stores (avoiding auction house tax?? To incentivize? Just an idea.)
					- Players can go inside their own houses.
					- Players can pay $$ to buy real estate.
					- If a player owns real estate, he/she can click on it to open up a building menu.
- Create minigames
	- "Fountain" minigame (find better analogy...)
		- Randomly spawns free items when you visit it
		- Not really a game, but it's its own view/experience (i.e. not an overlay like inventory).
	- Battle minigame
		- Requires database, could be tricky.
	- Propose one! Make your own!
- Create 'store'
	- Players can have their own personal store which they can fill up from their inventory.
	- These items are also available at the auction house, but have fixed prices (don't need bidding).
- Auction house
	- Requires database (i.e. multiple users), could be tricky

### Learning materials & general setup:
- Install
	* Node/npm
	* Git
		* Be able to use git bash
		* Understand basic git commands/concepts
			* push/pull/add/commit/branch/merge/clone/remote
- https://github.com/airbnb/javascript/tree/master/es5
- Eloquent Javascript
	* 1: "Values, Types, and Operators" ("Unary Operators" and down).
	* 3: "Functions"
	* 5: "Higher-Order Functions"
	* 6: "The Secret Life of Objects"
	* 13 "The Document Object Model"
	* Everything else is as-needed.

### Other Gameplay:
- Cities
	- Cities are hubs of activity and centers of trade.
		- Items for sale in one city cannot be purchased from another.
		- City dwellers receive benefits from trade?
	- Players can receive loot once a day from the town geyser (all towns form around geysers).
		- The story is that these geysers eject valuable treasures from the center of the planet.
	- By exploring, players can come across the ruins of old cities
		- New cities are formed in the ruins of old ones.
		- Players can attempt to settle there, but they do not become active cities until a certain population is reached. 
			- So why would people go there?
				- Early settlement
				- Proximity to resources?
				- Other...
- Caravan
	- Participate in inter-city trade by escorting caravans or creating your own.
		- Taking ideas from Puzzle Pirates here
		- As an escort, you participate in a certain amount of battles/minigames on the journey.
		- Your success helps determine the success of the venture
	- Relies on the idea that Cities are hubs of trade-- can't buy an item in one city's auction from a second city.
		- This creates scarcity.

### Library
- One goal of this project is to create a platform, or library, to which worlds can be attached.
- That is, we want to create a base framework and then be able to send arbitrary worlds to it to be run and displayed on the screen.
- How to accomplish this?
- First step is creating an example world or two and being able to run them. Then the common elements can be factored out.

### Other Notes
- Have a certain number of pets
- When the player isn't active, the pets can be set to do work (such as mining or crafting).
- They will passively generate materials that can be crafted into other things.
- Two types of views:
	- Experiences
		- Minigames, traveling through terrain or in a city, etc.
	- Overlays
		Things that appear on top of experiences, like inventory.