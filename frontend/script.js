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
            "http://127.0.0.1:5000/predict",
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
        // SANGli MARKER
        // ---------------------------------------------

        L.marker(
            [16.70, 74.24]
        )
        .addTo(map)
        .bindPopup(
            "<b>Sangli</b><br>" +
            "Disaster Monitoring Point"
        );


        // ---------------------------------------------
        // KOLHAPUR
        // ---------------------------------------------

        L.marker(
            [16.70, 74.24]
        )
        .addTo(map)
        .bindPopup(
            "<b>Sangli</b><br>" +
            "Risk Monitoring Area"
        );


        // ---------------------------------------------
        // KOLHAPUR
        // ---------------------------------------------

        L.marker(
            [16.7050, 74.2433]
        )
        .addTo(map)
        .bindPopup(
            "<b>Sangli Region</b><br>" +
            "AI Disaster Monitoring"
        );


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

    const input =
        document.getElementById("userMessage");

    const chatBox =
        document.getElementById("chatBox");


    if (!input || !chatBox) {

        console.error(
            "AI Assistant elements not found"
        );

        return;

    }


    const message =
        input.value.trim();


    if (message === "") {

        return;

    }


    // User message

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";

    userMessage.innerText =
        message;

    chatBox.appendChild(
        userMessage
    );


    input.value = "";


    // AI response

    setTimeout(
        function () {

            const aiMessage =
                document.createElement("div");

            aiMessage.className =
                "ai-message";

            aiMessage.innerText =
                generateResponse(message);

            chatBox.appendChild(
                aiMessage
            );


            chatBox.scrollTop =
                chatBox.scrollHeight;

        },
        500
    );

}


// =====================================================
// 5. AI RESPONSE
// =====================================================

function generateResponse(message) {

    const text =
        message.toLowerCase();


    if (
        text.includes("flood")
    ) {

        return (
            "Flood risk can increase due to " +
            "heavy rainfall, rising water levels " +
            "and low drainage capacity."
        );

    }


    if (
        text.includes("fire")
    ) {

        return (
            "Fire risk can be monitored using " +
            "temperature, humidity and environmental data."
        );

    }


    if (
        text.includes("earthquake")
    ) {

        return (
            "Earthquake monitoring requires " +
            "seismic activity and geological data."
        );

    }


    if (
        text.includes("alert")
    ) {

        return (
            "The disaster alert system continuously " +
            "monitors risk indicators."
        );

    }


    return (
        "I can help you understand disaster risks, " +
        "AI predictions and emergency response."
    );

}


// =====================================================
// 6. ENTER KEY FOR AI ASSISTANT
// =====================================================

function handleEnter(event) {

    if (
        event.key === "Enter"
    ) {

        sendMessage();

    }

}