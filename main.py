from flask import *
import os

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

app.run(host="0.0.0.0", port=5000)