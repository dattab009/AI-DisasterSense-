import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
data = pd.read_csv("../dataset/flood_data.csv")

# Input features
X = data[[
    "rainfall",
    "water_level",
    "temperature",
    "humidity"
]]

# Target
y = data["flood"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Create AI model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42
)

# Train model
model.fit(X_train, y_train)

# Test model
prediction = model.predict(X_test)

accuracy = accuracy_score(y_test, prediction)

print("Model Accuracy:", accuracy)

# Save trained model
joblib.dump(model, "disaster_model.pkl")

print("AI Flood Model trained successfully!")
print("Model saved as disaster_model.pkl")