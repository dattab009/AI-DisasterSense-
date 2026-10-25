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
// 2. LIVE DISASTER MAP
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log("🗺️ Initializing Live Map...");


        // ---------------------------------------------
        // CHECK LEAFLET
        // ---------------------------------------------

        if (typeof L === "undefined") {

            console.error(
                "❌ Leaflet library not loaded"
            );

            return;
        }


        // ---------------------------------------------
        // CHECK MAP ELEMENT
        // ---------------------------------------------

        const mapElement =
            document.getElementById("disasterMap");


        if (!mapElement) {

            console.error(
                "❌ disasterMap element not found"
            );

            return;
        }


        // ---------------------------------------------
        // CREATE MAP
        // ---------------------------------------------

        const map =
            L.map("disasterMap").setView(
                [16.70, 74.24],
                7
            );


        // ---------------------------------------------
        // OPENSTREETMAP TILES
        // ---------------------------------------------

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors",

                maxZoom: 19
            }
        ).addTo(map);


     
        // ---------------------------------------------
        // CLICK TO SELECT DISASTER LOCATION
        // ---------------------------------------------

        let selectedMarker = null;

        map.on("click", function (e) {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;

            // Remove the previous marker
            if (selectedMarker) {
                map.removeLayer(selectedMarker);
            }

            // Add marker only where the user clicks
         
            // Add marker exactly where the user clicks
            selectedMarker = L.marker([lat, lng])
                .addTo(map);

            selectedMarker.bindPopup(
                "<b>Selected Location</b><br>" +
                "Latitude: " + lat.toFixed(5) + "<br>" +
                "Longitude: " + lng.toFixed(5)
            ).openPopup();


            console.log("Selected location:", lat, lng);
        });


        // ---------------------------------------------
        // MAP READY
        // ---------------------------------------------

        console.log(
            "✅ Live Map initialized successfully"
        );


        // ---------------------------------------------
        // FIX MAP SIZE
        // ---------------------------------------------

        setTimeout(
            function () {

                map.invalidateSize();

            },
            300
        );

    }
);


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
    setTimeout(() => {
        const aiMessage = document.createElement("div");
        aiMessage.className = "message bot";

        aiMessage.innerText = generateResponse(message);

        chatBox.appendChild(aiMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
    }, 500);
}


// =====================================================
// 5. AI RESPONSE
// =====================================================


function generateResponse(message) {
    const text = String(message || "").toLowerCase().trim();

    if (!text) {
        return "Please type a question.";
    }

    // Flood
    if (/flood|पूर|पुर|अतिवृष्टी|waterlogging/.test(text)) {
        return "🌊 FLOOD SAFETY\n\n" +
            "• Move to higher ground if flooding occurs.\n" +
            "• Never walk or drive through floodwater.\n" +
            "• Stay away from electric wires and flooded equipment.\n" +
            "• Follow official evacuation instructions.";
    }

    // Fire
    if (/fire|burning|smoke|आग|धूर|जळत/.test(text)) {
        return "🔥 FIRE SAFETY\n\n" +
            "• Leave the building using a safe exit.\n" +
            "• Do not use elevators.\n" +
            "• Stay low if there is smoke.\n" +
            "• Never pour water on an electrical fire.\n" +
            "• In India, call 112 for emergency assistance.";
    }

    // Earthquake
    if (/earthquake|tremor|भूकंप|जमीन हादर/.test(text)) {
        return "🌎 EARTHQUAKE SAFETY\n\n" +
            "• Drop, Cover and Hold On.\n" +
            "• Protect your head and neck.\n" +
            "• Stay away from windows and heavy objects.\n" +
            "• After shaking stops, watch for aftershocks.";
    }

    // Alerts
    if (/alert|warning|इशारा|चेतावणी|अलर्ट/.test(text)) {
        return "🚨 DISASTER ALERTS\n\n" +
            "• Check official government alerts.\n" +
            "• Follow evacuation instructions.\n" +
            "• Keep your phone charged and emergency supplies ready.\n" +
            "• This chatbot does not receive live emergency alerts.";
    }

    // Weather and rain
    if (/weather|rain|rainfall|forecast|temperature|पाऊस|हवामान|तापमान/.test(text)) {
        return "🌦️ WEATHER SAFETY\n\n" +
            "• Check official weather forecasts.\n" +
            "• Avoid flooded roads during heavy rain.\n" +
            "• Seek shelter during lightning and storms.\n" +
            "• Live weather data is not available in this chatbot.";
    }

    // Cyclone and storm
    if (/cyclone|storm|hurricane|चक्रीवादळ|वादळ/.test(text)) {
        return "🌀 STORM SAFETY\n\n" +
            "• Stay inside a sturdy building.\n" +
            "• Keep away from windows.\n" +
            "• Follow official weather warnings.\n" +
            "• Avoid trees, power lines and flooded roads.";
    }

    // Landslide
    if (/landslide|mudslide|भूस्खलन|दरड/.test(text)) {
        return "⛰️ LANDSLIDE SAFETY\n\n" +
            "• Move away from slopes where soil or rocks are falling.\n" +
            "• Avoid damaged roads and unstable hillsides.\n" +
            "• Follow local authority instructions.";
    }

    // Lightning
    if (/lightning|thunder|वीज पड|विजांचा कडकडाट/.test(text)) {
        return "⚡ LIGHTNING SAFETY\n\n" +
            "• Seek shelter inside a substantial building or enclosed vehicle.\n" +
            "• Avoid open fields, isolated trees and water.\n" +
            "• Wait 30 minutes after the last thunder before going outside.";
    }

    // Heatwave
    if (/heatwave|heat stroke|उष्माघात|उष्णतेची लाट/.test(text)) {
        return "🌡️ HEAT SAFETY\n\n" +
            "• Drink water regularly.\n" +
            "• Avoid strenuous activity in extreme heat.\n" +
            "• Rest in a cool place.\n" +
            "• Seek urgent medical help for confusion or collapse.";
    }

    // First aid
    if (/first aid|bleeding|injury|जखम|रक्तस्त्राव|प्रथमोपचार/.test(text)) {
        return "🩹 FIRST AID\n\n" +
            "• Make sure the area is safe first.\n" +
            "• For bleeding, apply firm pressure with clean cloth or gauze.\n" +
            "• For serious injuries, seek urgent medical help.\n" +
            "• Avoid moving someone with a suspected serious spine injury unless there is immediate danger.";
    }

    // Emergency kit
    if (/emergency kit|survival kit|आपत्कालीन किट/.test(text)) {
        return "🎒 EMERGENCY KIT\n\n" +
            "• Drinking water and non-perishable food.\n" +
            "• First-aid supplies and essential medicines.\n" +
            "• Torch, batteries and phone charger.\n" +
            "• Important documents and emergency contacts.\n" +
            "• Prepare a family evacuation plan.";
    }

    // About your project
    if (/disastersense|your project|ai prediction|disaster prediction|तुझा प्रोजेक्ट/.test(text)) {
        return "🤖 ABOUT DISASTERSENSE\n\n" +
            "DisasterSense helps demonstrate disaster-risk prediction and safety awareness.\n\n" +
            "• The prediction model uses the inputs supported by your application.\n" +
            "• This chatbot provides predefined safety information.\n" +
            "• It does not independently verify live emergencies or weather.";
    }

    // Greetings
    if (/^(hi|hello|hey|नमस्कार|हॅलो|हाय)\b/.test(text)) {
        return "👋 Hello! Welcome to DisasterSense Safety Assistant.\n\n" +
            "Ask me about floods, fires, earthquakes, weather, storms, first aid or emergency preparation.\n\n" +
            "तुम्ही मराठी किंवा English मध्ये प्रश्न विचारू शकता.";
    }

    // Thanks
    if (/thank you|thanks|धन्यवाद/.test(text)) {
        return "😊 You're welcome! Stay safe and follow official safety guidance.";
    }

    // Help
    if (/help|what can you do|topics|काय विचारू|मदत/.test(text)) {
        return "💡 I can help with these topics:\n\n" +
            "🌊 Flood safety\n🔥 Fire safety\n🌎 Earthquake safety\n" +
            "🌧️ Weather precautions\n🌀 Cyclones and storms\n" +
            "⛰️ Landslides\n⚡ Lightning\n🌡️ Heatwaves\n" +
            "🩹 First aid\n🎒 Emergency kits\n\n" +
            "Example: What should I do during a flood?";
    }

    // Different fallback for unrecognized questions
    return "I couldn't identify your question's topic yet.\n\n" +
        "Please ask about a specific disaster, such as:\n" +
        "• What should I do during a flood?\n" +
        "• भूकंपाच्या वेळी काय करावे?\n" +
        "• How can I stay safe during a fire?\n" +
        "• What should an emergency kit contain?";
}
