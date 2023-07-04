from flask import *
import os
import random
from backend import *

# ╔═╗╔═╗╔═╗  ╦═╗╔═╗╦ ╦╔╦╗╔═╗╔═╗
# ╠═╣╠═╝╠═╝  ╠╦╝║ ║║ ║ ║ ║╣ ╚═╗
# ╩ ╩╩  ╩    ╩╚═╚═╝╚═╝ ╩ ╚═╝╚═╝
# APP ROUTES

app = Flask(__name__)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static'), 'assets/favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def home():
    return redirect("/home")

@app.route('/<page>')
def page(page):
    return render_template("{}.html".format(page))

@app.route('/bingo-generate', methods=['POST'])
def bingoGenerate():
    return bingo.formatBingoCard(json.loads(request.form.get('pokemon')))

    # return("requestOverload")
    # To be used when implementing some kind of max request speed, requestOverload is caught in js and error message is displayed

@app.route('/bingo-card-to-input', methods=['POST'])
def bingoCardToInput():
    return bingo.cardToinput(request.files["card"])

@app.route('/bingo-path-to-input', methods=['POST'])
def bingoPathToInput():
    return bingo.cardToinput(json.loads(request.form.get('path')))

@app.route('/bingo-library')
def library():
    return render_template("bingo-library.html", images=bingo.getAllBingoCards())

@app.route('/get-random-image')
def randomImg():
    imgtype = request.args.get("imgtype")
    dir = os.path.join(os.getcwd(), "static/assets/images/reactions/{}/".format(imgtype))
    image = dir + random.choice(os.listdir(dir))
    return send_file(image)

# START UP WEBSITE
app.run(host="0.0.0.0", port=5000)