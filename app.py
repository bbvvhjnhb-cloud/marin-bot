from flask import Flask

app = Flask(__name__)


@app.route("/")
def home():
    return "🎀 MARIN BOT IS ONLINE 🎀"


@app.route("/webhook", methods=["GET"])
def webhook_verify():
    return "MARIN WEBHOOK"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
