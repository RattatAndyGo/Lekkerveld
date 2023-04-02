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
def generateBingoCard(images : list, freeSquare : bool, completed : list, game : str, useShiny = False, width = 5, height = 5):
    im = Image.open("static/assets/images/bingo/bingo_template.jpg").copy()
    for i in range(height):
        for j in range(width):
            pokemon = Image.open("static/assets/images/bingo/{}/{}.png".format(game, images[i*height+j])).resize((279, 279))
            im.paste(pokemon, (41 + 294*j, 358 + 308*i))
    im.show()

# TODO
# scale up images to fixed size
# figure out exact offsets
# return image
# frontend interface + connection to backend

pokemon = []
completed = []
for i in range(25):
    pokemon.append(randint(1, 493))
    completed.append(False)
generateBingoCard(pokemon, 
                  True, 
                  completed,
                  "platinum",
                 )
app.run(host="0.0.0.0", port=5000)