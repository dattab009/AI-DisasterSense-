from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import os

app = Flask(__name__)

# =====================================
# CORS
# =====================================

CORS(app)


# =====================================
# LOAD AI MODEL
# =====================================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "disaster_model.pkl"
)

print("======================================")
print("   AI DisasterSense Backend")
print("======================================")
print("Model Path:", MODEL_PATH)


try:

    model = joblib.load(MODEL_PATH)

    print("✅ AI MODEL LOADED SUCCESSFULLY")

except Exception as e:

    print("❌ MODEL LOAD ERROR:")
    print(e)

    model = None


# =====================================
# HOME
# =====================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "online",
        "message": "AI DisasterSense Backend is running",
        "port": 5000
    })


# =====================================
# HEALTH CHECK
# =====================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "ai_model": "loaded" if model is not None else "not loaded"
    })


# =====================================
# AI PREDICTION
# =====================================

@app.route("/predict", methods=["POST"])
def predict():

    try:

        # Check model
        if model is None:

            return jsonify({
                "success": False,
                "error": "AI model is not loaded"
            }), 500


        # Get JSON
        data = request.get_json(force=True)

        print("")
        print("📥 DATA RECEIVED:")
        print(data)


        # =================================
        # SENSOR VALUES
        # =================================

        rainfall = float(
            data.get("rainfall", 0)
        )

        water_level = float(
            data.get("water_level", 0)
        )

        temperature = float(
            data.get("temperature", 0)
        )

        humidity = float(
            data.get("humidity", 0)
        )


        print("Rainfall:", rainfall)
        print("Water Level:", water_level)
        print("Temperature:", temperature)
        print("Humidity:", humidity)


        # =================================
        # MODEL FEATURES
        # =================================

        features = [[
            rainfall,
            water_level,
            temperature,
            humidity
        ]]


        # =================================
        # PREDICTION
        # =================================

        prediction = model.predict(
            features
        )[0]


        # =================================
        # PROBABILITY
        # =================================

        if hasattr(model, "predict_proba"):

            probability = (
                model.predict_proba(features)[0][1]
                * 100
            )

        else:

            probability = (
                100
                if prediction == 1
                else 0
            )


        probability = round(
            float(probability),
            2
        )


        # =================================
        # RISK LEVEL
        # =================================

        if probability >= 75:

            risk = "HIGH"

        elif probability >= 40:

            risk = "MODERATE"

        else:

            risk = "LOW"


        # =================================
        # RESULT
        # =================================

        result = {

            "success": True,

            "flood": int(prediction),

            "probability": probability,

            "risk": risk

        }


        print("")
        print("🤖 AI RESULT:")
        print(result)
        print("")


        return jsonify(result)


    except Exception as e:

        print("")
        print("❌ PREDICTION ERROR:")
        print(e)
        print("")


        return jsonify({

            "success": False,

            "error": str(e)

        }), 400


# =====================================
# START FLASK SERVER
# =====================================

if __name__ == "__main__":

    print("")
    print("======================================")
    print("   AI DisasterSense Backend")
    print("======================================")
    print("Backend: https://ai-disastersense-1.onrender.com")
    print("Health : https://ai-disastersense-1.onrender.com/health")
    print("Predict: https://ai-disastersense-1.onrender.com/predict")
    print("======================================")
    print("")

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )