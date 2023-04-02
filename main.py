from flask import *
import os
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

def generateBingoCard(images, freeSquare : bool,  width = 5, height = 5):
    im = Image.open("static/assets/images/bingo/bingo_template.jpg").copy()
    for i in range(width):
        for j in range(height):
            pokemon = Image.open("static/assets/images/bingo/rattata.png")
            im.paste(pokemon, (125 + 300*i, 450 + 300*j))
    im.show()

# TODO
# scale up images to fixed size
# figure out exact offsets
# return image
# frontend interface + connection to backend

generateBingoCard([], True)
app.run(host="0.0.0.0", port=5000)