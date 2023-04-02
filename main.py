from flask import *
import os
from random import randint
# import sys
from PIL import Image

app = Flask(__name__)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'assets/favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def home():
    return render_template("home.html")

@app.route('/faq')
def faq():
    return render_template("faq.html")

@app.route('/connect4')
def connect4():
    return render_template("connect4.html")

@app.route('/bingo-card')
def bingoCard():
    return render_template("bingo-card.html")

@app.route('/unfair-wordle')
def unfairWordle():
    return render_template("unfair-wordle.html")

def merge(im1, im2):
    w = im1.size[0] + im2.size[0]
    h = max(im1.size[1], im2.size[1])
    im = Image.new("RGBA", (w, h))

    im.paste(im1)
    im.paste(im2, (im1.size[0], 0))

    return im

# All Pokemon sprites sourced from https://veekun.com/dex/downloads
def generateBingoCard(images : list, completed : list, game : str, useShiny : bool, width, height):
    im = Image.open("static/assets/images/bingo/bingo_template.jpg").copy()
    if(useShiny):
        game = game + "/shiny"
    for i in range(height):
        for j in range(width):
            if(images[i*height+j] == -1):
                pokemon = Image.open("static/assets/images/bingo/free.png")
            else:
                pokemon = Image.open("static/assets/images/bingo/{}/{}.png".format(game, images[i*height+j])).resize((279, 279))
            im.paste(pokemon, (41 + 294*j, 358 + 308*i), pokemon.convert("RGBA"))
            if(completed[i*height+j]):
                completed_icon = Image.open("static/assets/images/bingo/completed.png")
                im.paste(completed_icon, (41 + 294*j, 398 + 308*i), completed_icon.convert("RGBA"))
    return im

def formatBingoCard(images : list, freeSquare : bool, completed : list, game : str, useShiny = False, width = 5, height = 5):
    pokemonMaxDict = {"gold":251, "silver":251, "crystal":251, "ruby-sapphire":386, "emerald":386, "firered-leafgreen":386, "diamond-pearl":493, "platinum":493, "heartgold-soulsilver":493, "black-white":649}
    pokemonMax = pokemonMaxDict[game]

    pokemonAmount = width * height
    if(freeSquare):
        pokemonAmount -= 1
    while(len(images) < pokemonAmount):
        i = randint(1, pokemonMax)
        while(i in images):
            i = randint(1, pokemonMax)
        images.append(i)
        completed.append(False)
    if(freeSquare):
        images.insert(len(images)//2, -1)
        completed.insert(len(images)//2, False)

    generateBingoCard(images, completed, game, useShiny, width, height).show()

# TODO
# alternate forms
# frontend interface + connection to backend (including all choices)

pokemon = []
completed = []
for i in range(25):
    mon = input("give a pokemon dex number: ")
    if(mon == ""):
        break
    pokemon.append(mon)
    completed.append(input("give a boolean: ") == "true")
print(completed)
freeSquare = (input("should there be a free square in the middle? ") == "yes")
game = input("what game should the sprites come from? ")
useShiny = (input("do you want to use shiny sprites? ") == "yes")
formatBingoCard(pokemon, 
                  freeSquare, 
                  completed,
                  game,
                  useShiny
                 )
app.run(host="0.0.0.0", port=5000)