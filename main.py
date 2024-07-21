import os
import random

from flask import *

from backend import *

app = Flask(__name__)

# Big letters via https://patorjk.com/software/taag/#p=display&f=Calvin%20S


# ╔═╗╔═╗╔═╗╔╦╗  ╦═╗╔═╗╔═╗ ╦ ╦╔═╗╔═╗╔╦╗╔═╗
# ╠═╝║ ║╚═╗ ║   ╠╦╝║╣ ║═╬╗║ ║║╣ ╚═╗ ║ ╚═╗
# ╩  ╚═╝╚═╝ ╩   ╩╚═╚═╝╚═╝╚╚═╝╚═╝╚═╝ ╩ ╚═╝
# POST REQUESTS

@app.route('/bingo-generate', methods=['POST'])
def bingoGenerate():
    return bingo.formatBingoCard(json.loads(request.form.get('id')), json.loads(request.form.get('pokemon')))

    # return("requestOverload")
    # To be used when implementing some kind of max request speed, requestOverload is caught in js and error message is displayed


@app.route('/bingo-card-to-input', methods=['POST'])
def bingoCardToInput():
    # Card can either be the file itself or the path of the file
    try:
        return bingo.cardToinput(request.files["card"])
    except Exception as e:
        return bingo.cardToinput(request.form.get("card"))


@app.route('/username-check-for-used', methods=['POST'])
def usernameCheckForUsed():
    return False
    return database.checkForUsed(json.loads(request.form.get('username')))


@app.route('/username-check-id', methods=['POST'])
def usernameCheckID():
    return True
    return database.checkID(json.loads(request.form.get('username')), json.loads(request.form.get('id')))


@app.route('/username-add-new-user', methods=['POST'])
def usernameAddNewUser():
    return "success"
    database.insertIntoDB(json.loads(request.form.get('username')), json.loads(request.form.get('id')))
    return "success"    # Return value is not used


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
