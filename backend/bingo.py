from PIL import Image
import os
from random import randint
import datetime
import pathlib

def merge(im1, im2):
    w = im1.size[0] + im2.size[0]
    h = max(im1.size[1], im2.size[1])
    im = Image.new("RGBA", (w, h))

    im.paste(im1)
    im.paste(im2, (im1.size[0], 0))

    return im

# All Pokemon sprites sourced from https://veekun.com/dex/downloads
def generateBingoCard(pokemonList, width = 5):
    # Offset to first square, and length of a square
    horizontal_offset = 41
    vertical_offset = 358
    horizontal_length = 294
    vertical_length = 308

    im = Image.open("static/assets/images/bingo/bingo_template.jpg").copy()

    cursor = [horizontal_offset, vertical_offset]     # coordinates of location next image

    # Every pokemon is an array of strings, formatted like [dexNo, game, isShiny (normal or shiny), isCompleted (incompleted or completed)]
    for pokemon in pokemonList:
        if(pokemon[2] == 'shiny'):
            pokemon[1] += "/shiny"

        if(pokemon[0] == "free"):
            sprite = Image.open("static/assets/images/bingo/free.png")
        else:
            sprite = Image.open("static/assets/images/bingo/{}/{}.png".format(pokemon[1], pokemon[0])).resize((279, 279))
        im.paste(sprite, (cursor[0], cursor[1]), sprite.convert("RGBA"))

        if(pokemon[3] == 'completed'):
            completed_icon = Image.open("static/assets/images/bingo/completed.png")
            im.paste(completed_icon, (cursor[0], cursor[1] + 40), completed_icon.convert("RGBA"))

        # Update cursor
        cursor[0] = (cursor[0] + horizontal_length)%(horizontal_length*width)
        if(cursor[0] == horizontal_offset):
            cursor[1] += vertical_length
    
    # SAVE im IN FOLDER, RETURN PATH TO IMAGE
    name = datetime.datetime.now().strftime("%m%d%H%M%S%f")         # Name is derived from current time, month-day-hour-minute-second-millisecond
    path = pathlib.Path("static/assets/images/bingo/bingo-cards/{}.png".format(name))
    path.touch(exist_ok=True)
    im.save(path, "PNG")

    return str(path)

def formatBingoCard(pokemonList, width = 5, height = 5):
    pokemonMaxDict = {"gold":251, "silver":251, "crystal":251, "ruby-sapphire":386, "emerald":386, "firered-leafgreen":386, "diamond-pearl":493, "platinum":493, "heartgold-soulsilver":493, "black-white":649}

    # Every pokemonList[i] is an array of strings, formatted like [dexNo, game, isShiny (normal or shiny), isCompleted (incompleted or completed)]
    for i in range(len(pokemonList)):
        wasRandomPokemon = (pokemonList[i][0] == "random")
        for j in range(len(pokemonList[i])):
            if(pokemonList[i][j] != "random"):
                continue
            pokemonList[i][j] = randomizeVariable(j)

        # pokemonList[i] is now non-random, input checks
        if(pokemonList[i][0] == "free"):
            pokemonList[i][1] = "normal"
            pokemonList[i][2] = "incompleted"
            continue

        if(not wasRandomPokemon):   # A Pokemon chosen by user should not be randomized, so game is randomized
            counter = 0
            while(getDexNo(pokemonList[i]) > pokemonMaxDict[pokemonList[i][1]]):
                pokemonList[i][1] = randomizeVariable(1)
                counter += 1
                if(counter > 127):
                    raise RecursionError("can't find a game with the pokemon in it (tried {} times)".format(counter))
            continue

        # If game has no sprite for pokemon, choose different pokemon 
        counter = 0
        while(getDexNo(pokemonList[i]) > pokemonMaxDict[pokemonList[i][1]] or getFirstOccurrence(pokemonList, pokemonList[i][0]) != i):
            pokemonList[i][0] = randomizeVariable(0)
            counter += 1
            if(counter > 127):
                raise RecursionError("can't find a pokemon in the chosen game (tried {} times)".format(counter))
    
    return generateBingoCard(pokemonList)

# Returns index of first Pokemon pokemon, or -1 if it is not present
def getFirstOccurrence(pokemonList, pokemon):
    for idx in range(len(pokemonList)):
        if(pokemon == pokemonList[idx][0]):
            return idx
    print("Pokemon {} not found!".format(pokemon))
    return -1

# [dexNo, game, isShiny, isCompleted]
def randomizeVariable(i):
    match(i):
        case 0:
            return randint(1, 649)
        case 1: 
            games = ["gold", "silver", "crystal", "ruby-sapphire", "emerald", "firered-leafgreen", "diamond-pearl", "platinum", "heartgold-soulsilver", "black-white"]
            return games[randint(0, len(games) - 1)]
        case 2:
            return("shiny" if randint(0, 1) == 1 else "normal")
        case 3: 
            return("completed" if randint(0, 1) == 1 else "incompleted")
        
# Helper function to get the dex number of a Pokemon, in case it is an alternate form
# Source https://stackoverflow.com/a/36434101
def getDexNo(pokemon):
    return int(''.join(filter(str.isdigit, str(pokemon[0]))))

# Returns an array of paths of all bingo cards
def getAllBingoCards():
    cards = []
    dir = "static/assets/images/bingo/bingo-cards"
    for file in os.listdir(dir):
        f = os.path.join(dir, file)
        # checking if it is a file
        if os.path.isfile(f):
            cards.append(f)
    return cards

# Given a card (uploaded and served via JS), return an array of array containing all info of the pokemon (dexNo, game, isShiny, isCompleted)
def cardToinput(path):
    print(path)
    # Offset to first square, and length of a square
    horizontal_offset = 41
    vertical_offset = 358
    horizontal_length = 294
    vertical_length = 308
    pokemon_width = 279     # Height is identical to width

    cursor = [horizontal_offset, vertical_offset]

    res = []

    for i in range(25):
        im = Image.open(path).copy()
        pokemon = im.crop((cursor[0], cursor[1], cursor[0] + pokemon_width, cursor[1] + pokemon_width))

        # Update cursor
        cursor[0] = (cursor[0] + horizontal_length)%(horizontal_length*5)
        if(cursor[0] == horizontal_offset):
            cursor[1] += vertical_length

        image = findImageMatch(pokemon)
        res.append(pathToPokemon(image))

    return res


# Given an image of one pokemon (cropped from a bingo card), find the path to the image used when generating the bingo card
def findImageMatch(image):
    debug_counter = 0
    d = "static/assets/images/bingo"        # Parent directory
    for dir in os.listdir(d):
        debug_counter += 1
        path = os.path.join(d, dir)
        if not os.path.isdir(path):
            continue

        for file in os.listdir(path):       # Iterate over files in children
            comparison = os.path.join(path, file)
            # checking if it is a file
            if not os.path.isfile(comparison):
                continue

            shiny_comparison = os.path.join(path, os.path.join("shiny", file))
            # checking if it is a file
            if not os.path.isfile(shiny_comparison):
                continue

            comparison_image = Image.open(comparison).resize((279, 279)).convert("RGB")
            shiny_comparison_image = Image.open(shiny_comparison).resize((279, 279)).convert("RGB")

            if(checkMatch(image, comparison_image)):
                return comparison
            if(checkMatch(image, shiny_comparison_image)):
                return shiny_comparison
            
    return None

# Given an image of one pokemon (cropped from a bingo card) and a pokemon to compare to, returns whether or not they match
def checkMatch(pokemon, comparison):
    # Check central pixel first, this gives a big chance of failing
    if(not pokemon.getpixel((140, 140)) == comparison.getpixel((140, 140))):
        # print("failed center pixel check")
        return False

    # Now check grid of equally spaced pixels for a more thorough check
    fault_tolerance = 50         # Amount of pixels that can be wrong, as at the edges they can get wonky values
    start_x = 90
    start_y = 90
    end_x = 210
    end_y = 210
    loop_size = 20      # How many rows/columns should be checked?
    increment_x = (end_x-start_x)//loop_size
    increment_y = (end_y-start_y)//loop_size

    for i in range(loop_size):
        for j in range(loop_size):
            ppix = pokemon.getpixel((start_x+increment_x*i, start_y+increment_y*j))
            cpix = comparison.getpixel((start_x+increment_x*i, start_y+increment_y*j))
            # print("ppix == {}; cpix == {}".format(ppix, cpix))

            if(not (ppix == cpix or cpix == (0, 0, 0) or cpix == (255, 255, 255)) ):
                # print("{}; {}".format(i, j))
                fault_tolerance -= 1
                if(fault_tolerance == 0):
                    return False
    print("faults: {}".format(50 - fault_tolerance))
    return True

# Given the path to an image of a Pokemon, returns the [Pokemon, Game, isShiny, isCompleted] pokemon info (isCompleted is always False)
def pathToPokemon(path):
    if(path == None):
        print("NO POKEMON FOUND SAD POG")
        return ["free", "random", "normal", "incompleted"]

    path = path.split("/")
    pokemon = path[-1].replace(".png", "")
    game = path[4]
    if "shiny" in path:
        isShiny = "shiny"
    else:
        isShiny = "normal"

    return [pokemon, game, isShiny, "incompleted"]