import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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
        let data = null;

        // Method 1: Check if the tracking input is the direct Document ID
        const docRef = doc(db, "shipments", trackingInput);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data();
        } else {
            // Method 2: If not found by ID, query by field names (trackingNumber or waybill)
            const q1 = query(collection(db, "shipments"), where("trackingNumber", "==", trackingInput));
            let querySnapshot = await getDocs(q1);

            if (querySnapshot.empty) {
                const q2 = query(collection(db, "shipments"), where("waybill", "==", trackingInput));
                querySnapshot = await getDocs(q2);
            }

            if (!querySnapshot.empty) {
                data = querySnapshot.docs[0].data();
            }
        }

        if (data) {
            document.getElementById('res-track').innerText = trackingInput;
            document.getElementById('res-status').innerText = data.status || data.currentStatus || "N/A";
            document.getElementById('res-location').innerText = `${data.current_city_country || data.currentLocation || "N/A"} - Facility: ${data.current_facility || "N/A"}`;
            document.getElementById('res-origin').innerText = data.sender_country || data.originHub || "N/A";
            document.getElementById('res-destination').innerText = data.receiver_country || data.destinationHub || "N/A";
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
