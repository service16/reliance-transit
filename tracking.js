import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    projectId: "reliance-transit"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.fetchShipmentDetails = async function() {
    const trackingInput = document.getElementById('search-code').value.trim();
    const resultContainer = document.getElementById('result-container');

    if (!trackingInput) {
        alert("Please enter a valid tracking number.");
        return;
    }

    try {
        const docRef = doc(db, "shipments", trackingInput);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('res-track').innerText = data.trackingNumber || trackingInput;
            document.getElementById('res-status').innerText = data.currentStatus || "N/A";
            document.getElementById('res-location').innerText = data.currentLocation || "N/A";
            document.getElementById('res-origin').innerText = data.originHub || "N/A";
            document.getElementById('res-destination').innerText = data.destinationHub || "N/A";
            document.getElementById('res-delivery').innerText = data.estimatedDelivery || "N/A";

            resultContainer.style.display = 'block';
        } else {
            resultContainer.style.display = 'none';
            alert("No shipment found with this tracking number. Please check the ID and try again.");
        }
    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Failed to fetch shipment details from the cloud.");
    }
};
