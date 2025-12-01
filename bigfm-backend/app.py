# app.py
from flask import Flask
from flask_cors import CORS

# import APIs
from routes.upload_api import upload_bp
from routes.agentApi import agent_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# register API groups
app.register_blueprint(upload_bp)
app.register_blueprint(agent_bp)
app.register_blueprint(dashboard_bp)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
