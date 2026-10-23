// =====================================================
// AI DISASTERSENSE - MAIN JAVASCRIPT
// =====================================================


// =====================================================
// 1. RUN AI RISK SCAN
// =====================================================
const API_URL = "https://ai-disastersense-1.onrender.com";
async function startScan() {

    console.log("🚀 RUN RISK SCAN CLICKED");

    const scanButton = document.getElementById("runScanBtn");

    if (scanButton) {
        scanButton.innerText = "⏳ AI SCANNING...";
        scanButton.disabled = true;
    }

    try {

        // ---------------------------------------------
        // GET SENSOR VALUES
        // ---------------------------------------------

        const rainfall =
            Number(document.getElementById("rainfall").value);

        const waterLevel =
            Number(document.getElementById("waterLevel").value);

        const temperature =
            Number(document.getElementById("temperature").value);

        const humidity =
            Number(document.getElementById("humidity").value);


        console.log("📊 Sensor Data:", {
            rainfall,
            waterLevel,
            temperature,
            humidity
        });


        // ---------------------------------------------
        // VALIDATION
        // ---------------------------------------------

        if (
            isNaN(rainfall) ||
            isNaN(waterLevel) ||
            isNaN(temperature) ||
            isNaN(humidity)
        ) {

            alert("Please enter all sensor values.");

            return;
        }


        // ---------------------------------------------
        // CHECK FLASK BACKEND
        // ---------------------------------------------

        console.log("🔌 Checking Flask backend...");


       const healthResponse = await fetch(
    "https://ai-disastersense-1.onrender.com/health"
);

if (!healthResponse.ok) {
    throw new Error(
        "Flask /health endpoint failed"
    );
}


        console.log("✅ Flask backend connected");


        // ---------------------------------------------
        // SEND DATA TO AI MODEL
        // ---------------------------------------------

        console.log("🤖 Sending data to AI model...");


        const response = await fetch(
    "https://ai-disastersense-1.onrender.com/predict",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    rainfall: rainfall,

                    water_level: waterLevel,

                    temperature: temperature,

                    humidity: humidity

                })
            }
        );


        if (!response.ok) {

            const errorText = await response.text();

            console.error(
                "Prediction API Error:",
                errorText
            );

            throw new Error(
                "Prediction API returned error"
            );

        }


        const result = await response.json();


        console.log("🤖 AI RESULT:", result);


        // ---------------------------------------------
        // CHECK BACKEND RESULT
        // ---------------------------------------------

        if (result.success === false) {

            throw new Error(
                result.error || "AI prediction failed"
            );

        }


        // ---------------------------------------------
        // UPDATE AI RESULT CARD
        // ---------------------------------------------

        const riskElement =
            document.getElementById("aiRisk");

        const probabilityElement =
            document.getElementById("aiProbability");


        if (!riskElement) {

            throw new Error(
                "aiRisk element not found in HTML"
            );

        }


        if (!probabilityElement) {

            throw new Error(
                "aiProbability element not found in HTML"
            );

        }


        // Risk text

        riskElement.innerText =
            result.risk || "UNKNOWN";


        // Probability

        probabilityElement.innerText =
            (result.probability ?? 0) + "%";


        // ---------------------------------------------
        // RISK COLOR
        // ---------------------------------------------

        if (result.risk === "HIGH") {

            riskElement.style.color =
                "#ef4444";

        }

        else if (result.risk === "MODERATE") {

            riskElement.style.color =
                "#f97316";

        }

        else {

            riskElement.style.color =
                "#22c55e";

        }


        // ---------------------------------------------
        // UPDATE FLOOD CARD
        // ---------------------------------------------

        const floodRisk =
            document.getElementById("floodRisk");

        const floodProgress =
            document.getElementById("floodProgress");


        if (floodRisk) {

            floodRisk.innerText =
                Math.round(result.probability);

        }


        if (floodProgress) {

            floodProgress.style.width =
                Math.min(result.probability, 100) + "%";

        }


        // ---------------------------------------------
        // UPDATE SCAN STATUS
        // ---------------------------------------------

        const scanStatus =
            document.getElementById("scanStatus");


        if (scanStatus) {

            scanStatus.innerText =
                "AI SCAN COMPLETED";

        }


        console.log(
            "✅ AI SCAN COMPLETED"
        );

    }

    catch (error) {

        console.error(
            "❌ AI SCAN ERROR:",
            error
        );


        alert(
            "AI Backend connection failed.\n\n" +
            "Make sure Flask is running on port 5000.\n\n" +
            "Error: " +
            error.message
        );

    }

    finally {

        if (scanButton) {

            scanButton.innerText =
                "⚡ Run Risk Scan";

            scanButton.disabled =
                false;

        }

    }

}



 // =====================================================
 // LIVE DISASTER MAP - CLICK ANYWHERE TO SELECT LOCATION
 // =====================================================

document.addEventListener("DOMContentLoaded", function () {
    console.log("🗺️ Initializing Live Map...");

    if (typeof L === "undefined") {
        console.error("❌ Leaflet library not loaded");
        return;
    }

    const mapElement = document.getElementById("disasterMap");

    if (!mapElement) {
        console.error("❌ disasterMap element not found");
        return;
    }

    // Initial map view: India

const map = L.map("disasterMap", {
    maxBounds: [
        [5.0, 65.0],
        [38.5, 100.0]
    ],
    maxBoundsViscosity: 1.0
}).setView([19.5, 75.5], 7);


    // OpenStreetMap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19
    }).addTo(map);

    // Marker for the location selected by the user
    let selectedMarker = null;

    // Click anywhere on the map
    map.on("click", function (event) {
        const lat = event.latlng.lat;
        const lng = event.latlng.lng;

        // Remove the previous selected marker
        if (selectedMarker) {
            map.removeLayer(selectedMarker);
        }

        // Add a marker at the clicked location
        selectedMarker = L.marker([lat, lng]).addTo(map);

        selectedMarker.bindPopup(
            "<b>Selected Location</b><br>" +
            "Latitude: " + lat.toFixed(5) + "<br>" +
            "Longitude: " + lng.toFixed(5)
        ).openPopup();

        console.log("📍 Selected location:", {
            latitude: lat,
            longitude: lng
        });
    });

    console.log("✅ Live Map initialized successfully");

    setTimeout(function () {
        map.invalidateSize();
    }, 300);
});



// =====================================================
// 3. SHOW ALERT
// =====================================================

function showAlert() {

    alert(
        "⚠️ Disaster Alert System\n\n" +
        "AI monitoring system is active."
    );

}


// =====================================================
// 4. AI ASSISTANT
// =====================================================


function sendMessage() {
    const input = document.getElementById("userMessage");
    const chatBox = document.getElementById("chatMessages");

    if (!input || !chatBox) {
        console.error("AI Assistant elements not found");
        return;
    }

    const message = input.value.trim();

    if (message === "") return;

    // Display user message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.innerText = message;
    chatBox.appendChild(userMessage);

    input.value = "";

    // Display AI response
    
function generateResponse(message) {
    const text = message.toLowerCase().trim();

    // FLOOD
    if (text.includes("flood")) {
        return "During a flood emergency, move to higher ground, avoid walking or driving through floodwater, follow official alerts, and contact local emergency services if you are in danger.";
    }

    // HEAVY RAIN
    if (
        text.includes("rain") ||
        text.includes("rainfall") ||
        text.includes("heavy rainfall")
    ) {
        return "During heavy rainfall, stay in a safe place, avoid flooded roads and rivers, monitor official weather alerts, and prepare essential supplies.";
    }

    // FIRE
    if (text.includes("fire")) {
        return "If you see a fire, move away from danger, warn nearby people if safe, avoid smoke, and contact the local fire emergency service.";
    }

    // EARTHQUAKE
    if (
        text.includes("earthquake") ||
        text.includes("quake")
    ) {
        return "During an earthquake, drop, cover, and hold on. Stay away from windows. If outdoors, move away from buildings, trees, and power lines.";
    }

    // CYCLONE
    if (
        text.includes("cyclone") ||
        text.includes("hurricane")
    ) {
        return "Follow official cyclone warnings, secure loose outdoor objects, prepare drinking water and essential supplies, and evacuate if authorities instruct you to do so.";
    }

    // LANDSLIDE
    if (text.includes("landslide")) {
        return "Warning signs can include ground cracks, leaning trees, and unusual rumbling. Move away from the slope if safe and follow official evacuation instructions.";
    }

    // TSUNAMI
    if (text.includes("tsunami")) {
        return "If you are in a coastal area and receive a tsunami warning, move immediately to higher ground or inland and follow official evacuation instructions.";
    }

    // AI PREDICTION
    if (
        text.includes("ai") ||
        text.includes("prediction") ||
        text.includes("predict")
    ) {
        return "AI can analyze rainfall, water levels, temperature, humidity, and other environmental data to estimate disaster risks. Predictions are estimates, not guarantees.";
    }

    // ALERTS
    if (
        text.includes("alert") ||
        text.includes("warning")
    ) {
        return "Check official government and weather department alerts. If authorities issue an evacuation order, follow their instructions promptly.";
    }

    // SAFETY
    if (
        text.includes("safe") ||
        text.includes("safety") ||
        text.includes("emergency")
    ) {
        return "Stay calm, move away from immediate danger, keep your phone charged, prepare essential supplies, and follow instructions from local emergency authorities.";
    }

    // THANK YOU
    if (
        text.includes("thank") ||
        text.includes("thanks")
    ) {
        return "You're welcome! Stay safe. I can help with disaster safety, flood risks, fires, earthquakes, cyclones, and AI predictions.";
    }

    // DEFAULT RESPONSE
    return "I can help with floods, heavy rainfall, fires, earthquakes, cyclones, landslides, emergency safety, and AI disaster predictions. Please ask me a question about one of these topics.";
}


// =====================================================
// 6. ENTER KEY FOR AI ASSISTANT
// =====================================================

function handleEnter(event) {

    if (
        event.key === "Enter"
    ) {
        event.preventDefault();
        
        sendMessage();

    }

}