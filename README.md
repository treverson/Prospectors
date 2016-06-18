Notes:
test
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

Minimum:
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

Implementation:

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