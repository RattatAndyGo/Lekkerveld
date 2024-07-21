import datetime
import os
import pathlib
from random import randint

from PIL import Image
from PIL.PngImagePlugin import PngInfo


def merge(im1, im2):
    w = im1.size[0] + im2.size[0]
    h = max(im1.size[1], im2.size[1])
    im = Image.new("RGBA", (w, h))

    im.paste(im1)
    im.paste(im2, (im1.size[0], 0))

    return im


# All Pokemon sprites sourced from https://veekun.com/dex/downloads
def generateBingoCard(pokemonList, width=5):
    # Offset to first square, and length of a square
    horizontal_offset = 52
    vertical_offset = 369
    horizontal_length = 294
    vertical_length = 308

    im = Image.open("static/assets/images/bingo/bingo_template.jpg").copy()

    cursor = [horizontal_offset, vertical_offset]     # coordinates of location next image

    # Every pokemon is an array of strings, formatted like [dexNo, game, isShiny (normal or shiny), isCompleted (incompleted or completed)]
    for pokemon in pokemonList:
        if (pokemon[2] == 'shiny'):
            pokemon[1] += "/shiny"

        if (pokemon[0] == "free"):
            sprite = Image.open("static/assets/images/bingo/free.png")
        else:
            sprite = Image.open("static/assets/images/bingo/{}/{}.png".format(pokemon[1], pokemon[0])).resize((256, 256), resample=Image.NEAREST)
        im.paste(sprite, (cursor[0], cursor[1]), sprite.convert("RGBA"))

        if (pokemon[3] == 'completed'):
            completed_icon = Image.open("static/assets/images/bingo/completed.png")
            im.paste(completed_icon, (cursor[0], cursor[1] + 40), completed_icon.convert("RGBA"))

        # Update cursor
        cursor[0] = (cursor[0] + horizontal_length) % (horizontal_length * width)
        if (cursor[0] == horizontal_offset):
            cursor[1] += vertical_length

    # Add metadata
    metadata = PngInfo()
    metadata.add_text("test", "value")
    metadata.add_text("pokemonList", str(pokemonList))

    # Save im in folder, return path to image
    name = datetime.datetime.now().strftime("%m%d%H%M%S%f")         # Name is derived from current time, month-day-hour-minute-second-millisecond
    path = pathlib.Path("static/assets/images/bingo/bingo-cards/{}.png".format(name))
    path.touch(exist_ok=True)
    im.save(path, "PNG", pnginfo=metadata)

    return str(path)


def formatBingoCard(id, pokemonList, width=5, height=5):
    pokemonMaxDict = {"gold": 251, "silver": 251, "crystal": 251, "ruby-sapphire": 386, "emerald": 386, "firered-leafgreen": 386, "diamond-pearl": 493, "platinum": 493, "heartgold-soulsilver": 493, "black-white": 649}

    # Every pokemonList[i] is an array of strings, formatted like [dexNo, game, isShiny (normal or shiny), isCompleted (incompleted or completed)]
    for i in range(len(pokemonList)):
        wasRandomPokemon = (pokemonList[i][0] == "random")
        for j in range(len(pokemonList[i])):
            if (pokemonList[i][j] != "random"):
                continue
            pokemonList[i][j] = randomizeVariable(j)

        # pokemonList[i] is now non-random, input checks
        if (pokemonList[i][0] == "free"):
            pokemonList[i][1] = "normal"
            pokemonList[i][2] = "incompleted"
            continue

        if (not wasRandomPokemon):   # A Pokemon chosen by user should not be randomized, so game is randomized
            counter = 0
            while (getDexNo(pokemonList[i]) > pokemonMaxDict[pokemonList[i][1]]):
                pokemonList[i][1] = randomizeVariable(1)
                counter += 1
                if (counter > 127):
                    raise RecursionError("can't find a game with the pokemon in it (tried {} times)".format(counter))
            continue

        # If game has no sprite for pokemon, choose different pokemon
        counter = 0
        while (getDexNo(pokemonList[i]) > pokemonMaxDict[pokemonList[i][1]] or getFirstOccurrence(pokemonList, pokemonList[i][0]) != i):
            pokemonList[i][0] = randomizeVariable(0)
            counter += 1
            if (counter > 127):
                raise RecursionError("can't find a pokemon in the chosen game (tried {} times)".format(counter))

    return generateBingoCard(pokemonList)


# Returns index of first occurrence of pokemon, or -1 if it is not present
def getFirstOccurrence(pokemonList, pokemon):
    for idx in range(len(pokemonList)):
        if (pokemon == pokemonList[idx][0]):
            return idx
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
            return ("shiny" if randint(0, 1) == 1 else "normal")
        case 3:
            return ("completed" if randint(0, 1) == 1 else "incompleted")


# Helper function to get the dex number of a Pokemon, in case it is an alternate form
# Source https://stackoverflow.com/a/36434101
def getDexNo(pokemon):
    return int(''.join(filter(str.isdigit, str(pokemon[0]))))


# Given a card (uploaded and served via JS), return an array of arrays containing all info of the pokemon (dexNo, game, isShiny, isCompleted)
def cardToinput(im):
    card = Image.open(im).copy()

    # Check if metadata is present
    res = card.info.get("pokemonList")
    if (res != None):
        return eval(res)

    # Metadata is not present, use image pixels to determine pokemon
    pokemon_width = 256     # Height is identical to width
    pokemonList = getPokemonImagesFromCard(card, pokemon_width)
    res = [["free", "random", "normal", "incompleted"]] * len(pokemonList)       # Fill res with filler values to allow random access to elements

    d = "static/assets/images/bingo"        # Parent directory
    for dir in os.listdir(d):
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

            comparison_image = Image.open(comparison).resize((256, 256), resample=Image.NEAREST).convert("RGB")
            shiny_comparison_image = Image.open(shiny_comparison).resize((256, 256), resample=Image.NEAREST).convert("RGB")

            for i in range(len(pokemonList)):
                if (checkMatch(pokemonList[i], comparison_image)):
                    res[i] = pathToPokemon(comparison)
                elif (checkMatch(pokemonList[i], shiny_comparison_image)):
                    res[i] = pathToPokemon(shiny_comparison)

    return res


def getPokemonImagesFromCard(card, pokemon_width):
    # Offset to first square, and length of a square
    horizontal_offset = 52
    vertical_offset = 369
    horizontal_length = 294
    vertical_length = 308

    cursor = [horizontal_offset, vertical_offset]

    res = []
    for i in range(25):
        pokemon = card.crop((cursor[0], cursor[1], cursor[0] + pokemon_width, cursor[1] + pokemon_width))
        res.append(pokemon)

        # Update cursor
        cursor[0] = (cursor[0] + horizontal_length) % (horizontal_length * 5)
        if (cursor[0] == horizontal_offset):
            cursor[1] += vertical_length

    return res


# Given an image of one pokemon (cropped from a bingo card) and a pokemon to compare to, returns whether or not they match
def checkMatch(pokemon, comparison):
    # Check grid of equally spaced pixels
    start_x = 90
    start_y = 90
    end_x = 210
    end_y = 210
    loop_size = 5      # How many rows/columns should be checked?
    increment_x = (end_x - start_x) // loop_size
    increment_y = (end_y - start_y) // loop_size

    for i in range(loop_size):
        for j in range(loop_size):
            ppix = pokemon.getpixel((start_x + increment_x * i, start_y + increment_y * j))
            cpix = comparison.getpixel((start_x + increment_x * i, start_y + increment_y * j))

            if (not (ppix == cpix or ppix == (255, 255, 255))):
                return False
    return True


# Given the path to an image of a Pokemon, returns the [Pokemon, Game, isShiny, isCompleted] pokemon info (isCompleted is always False)
def pathToPokemon(path):
    path = path.split("/")
    pokemon = path[-1].replace(".png", "")
    game = path[4]
    if "shiny" in path:
        isShiny = "shiny"
    else:
        isShiny = "normal"

    return [pokemon, game, isShiny, "incompleted"]
