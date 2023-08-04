from flask import *
import os
import random
from backend import *


app = Flask(__name__)

# Big letters via https://patorjk.com/software/taag/#p=display&f=Calvin%20S


# ╔═╗╔═╗╔═╗╔╦╗  ╦═╗╔═╗╔═╗ ╦ ╦╔═╗╔═╗╔╦╗╔═╗
# ╠═╝║ ║╚═╗ ║   ╠╦╝║╣ ║═╬╗║ ║║╣ ╚═╗ ║ ╚═╗
# ╩  ╚═╝╚═╝ ╩   ╩╚═╚═╝╚═╝╚╚═╝╚═╝╚═╝ ╩ ╚═╝
# POST REQUESTS

@app.route('/bingo-generate', methods=['POST'])
def bingoGenerate():
    return bingo.formatBingoCard(json.loads(request.form.get('pokemon')))

    # return("requestOverload")
    # To be used when implementing some kind of max request speed, requestOverload is caught in js and error message is displayed

@app.route('/bingo-card-to-input', methods=['POST'])
def bingoCardToInput():
    return bingo.cardToinput(request.files["card"])

@app.route('/bingo-save-board', methods=['POST'])
def bingoSaveBoard():
    bingo.saveBoard(json.loads(request.form.get('id')))
    return "OK", 200

@app.route('/bingo-load-board', methods=['POST'])
def bingoLoadBoard():
    return bingo.loadBoard(json.loads(request.form.get('id')))

@app.route('/username-check-for-used', methods=['POST'])
def bingoCheckForUsed():
    return username.checkForUsed(json.loads(request.form.get('username')))

@app.route('/username-check-id', methods=['POST'])
def bingoCheckID():
    return username.checkID(json.loads(request.form.get('username')), json.loads(request.form.get('id')))


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

@app.route('/get-random-image')
def randomImg():
    imgtype = request.args.get("imgtype")
    dir = os.path.join(os.getcwd(), "static/assets/images/reactions/{}/".format(imgtype))
    image = dir + random.choice(os.listdir(dir))
    return send_file(image)

# START UP WEBSITE
app.run(host="0.0.0.0", port=5000)