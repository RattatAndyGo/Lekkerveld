from flask import *
import os
from random import randint
import datetime
from PIL import Image
import pathlib


# ╔╗ ╔═╗╔═╗╦╔═╔═╗╔╗╔═╦╗  ╔═╗╔═╗═╦╗╔═╗
# ╠╩╗╠═╣║  ╠╩╗║╣ ║║║ ║║  ║  ║ ║ ║║║╣ 
# ╚═╝╩ ╩╚═╝╩ ╩╚═╝╝╚╝═╩╝  ╚═╝╚═╝═╩╝╚═╝
# BACKEND CODE

# BINGO CARD GENERATOR

def merge(im1, im2):
    w = im1.size[0] + im2.size[0]
    h = max(im1.size[1], im2.size[1])
    im = Image.new("RGBA", (w, h))

    im.paste(im1)
    im.paste(im2, (im1.size[0], 0))

    return im

# All Pokemon sprites sourced from https://veekun.com/dex/downloads
def generateBingoCard(pokemonList, width, height):
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
    path = pathlib.Path("static/assets/images/bingo/bingo-cards/{}.jpeg".format(name))
    path.touch(exist_ok=True)
    im.save(path, "JPEG")

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
    
    return generateBingoCard(pokemonList, width, height)

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

def getAllBingoCards():
    cards = []
    dir = "static/assets/images/bingo/bingo-cards"
    for file in os.listdir(dir):
        f = os.path.join(dir, file)
        # checking if it is a file
        if os.path.isfile(f):
            cards.append(f)
    return cards

app = Flask(__name__)








# ╔═╗╔═╗╔═╗  ╦═╗╔═╗╦ ╦╔╦╗╔═╗╔═╗
# ╠═╣╠═╝╠═╝  ╠╦╝║ ║║ ║ ║ ║╣ ╚═╗
# ╩ ╩╩  ╩    ╩╚═╚═╝╚═╝ ╩ ╚═╝╚═╝
# APP ROUTES

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'assets/favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def home():
    return redirect("/home")

@app.route('/<page>')
def page(page):
    return render_template("{}.html".format(page))

counter = 0
lastPostRequest = datetime.datetime.now()
@app.route('/bingo', methods=['POST'])
def bingoPost():
    global counter, lastPostRequest
    time = datetime.datetime.now()
    elapsedTime = time - lastPostRequest
    lastPostRequest = time
    if(elapsedTime.days * 24*60*60 + elapsedTime.seconds > 30):     # Waiting 30+ seconds resets counter
        counter = 0
    elif(counter < 10):                                             # If <10 requests were made, continue and increment counter
        counter += 1
    else:
        return("requestOverload")   # Gets caught, frontend shows an overload message
    return formatBingoCard(json.loads(request.form.get('pokemon')))


@app.route('/bingo-library')
def library():
    return render_template("bingo-library.html", images=getAllBingoCards())

# START UP WEBSITE
app.run(host="0.0.0.0", port=5000)