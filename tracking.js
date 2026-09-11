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
    const notFoundContainer = document.getElementById('not-found-container');

    if (!trackingInput) {
        alert("Please enter a valid tracking number.");
        return;
    }

    try {
        const docRef = doc(db, "shipments", trackingInput);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('res-track').innerText = trackingInput;
            document.getElementById('res-status').innerText = data.status || "N/A";
            document.getElementById('res-location').innerText = `${data.current_city_country || "N/A"} - Facility: ${data.current_facility || "N/A"}`;
            document.getElementById('res-origin').innerText = data.sender_country || "N/A";
            document.getElementById('res-destination').innerText = data.receiver_country || "N/A";
            document.getElementById('res-delivery').innerText = "Standard Transit (Stage " + (data.stage || "1") + ")";

            if (resultContainer) resultContainer.style.display = 'block';
            if (notFoundContainer) notFoundContainer.style.display = 'none';
        } else {
            if (resultContainer) resultContainer.style.display = 'none';
            if (notFoundContainer) notFoundContainer.style.display = 'block';
        }
    } catch (error) {
        console.error("Firestore Error:", error);
        alert("Failed to fetch shipment details from the cloud.");
    }
};
