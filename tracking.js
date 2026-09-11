import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    projectId: "reliance-transit"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.fetchShipmentDetails = async function() {
    const trackingInput = document.getElementById('search-code').value.trim();
    const resultContainer = document.getElementById('result-container');
    const notFoundContainer = document.getElementById('not-found-container'); // if present in your HTML

    if (!trackingInput) {
        alert("Please enter a valid tracking number.");
        return;
    }

    try {
        const q = query(collection(db, "shipments"), where("trackingNumber", "==", trackingInput));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();
            
            document.getElementById('res-track').innerText = data.trackingNumber || trackingInput;
            document.getElementById('res-status').innerText = data.currentStatus || "N/A";
            document.getElementById('res-location').innerText = data.currentLocation || "N/A";
            document.getElementById('res-origin').innerText = data.originHub || "N/A";
            document.getElementById('res-destination').innerText = data.destinationHub || "N/A";
            document.getElementById('res-delivery').innerText = data.estimatedDelivery || "N/A";

            if (resultContainer) resultContainer.style.display = 'block';
            if (notFoundContainer) notFoundContainer.style.display = 'none';
        } else {
            if (resultContainer) resultContainer.style.display = 'none';
            if (notFoundContainer) notFoundContainer.style.display = 'block';
            else alert("No shipment found with this tracking number.");
        }
    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Failed to fetch shipment details from the cloud.");
    }
};
