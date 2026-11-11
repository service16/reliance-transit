import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    projectId: "reliance-transit"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Get a value from whichever matching field exists.
function getField(data, fields, fallback = "N/A") {
    for (const field of fields) {
        if (
            data[field] !== undefined &&
            data[field] !== null &&
            data[field] !== ""
        ) {
            return data[field];
        }
    }

    return fallback;
}


// Format Firestore timestamps and ordinary dates.
function formatDate(value) {
    if (!value) return "Date not provided";

    let date;

    if (value && typeof value.toDate === "function") {
        date = value.toDate();
    } else if (typeof value === "object" && value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        date = new Date(value);
    }

    if (isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString();
}


// Convert event date to a timestamp for sorting.
function getDateValue(event) {
    const value = getField(
        event,
        ["date", "timestamp", "createdAt", "updatedAt", "time", "created_at"],
        null
    );

    if (!value) return 0;

    if (value && typeof value.toDate === "function") {
        return value.toDate().getTime();
    }

    if (typeof value === "object" && value.seconds) {
        return value.seconds * 1000;
    }

    const parsed = new Date(value).getTime();

    return isNaN(parsed) ? 0 : parsed;
}


// Display additional package details.
function displayPackageDetails(data) {
    const container = document.getElementById("shipment-extra-details");

    if (!container) return;

    container.innerHTML = "";

   const details = [
    ["Sender Name", ["sender", "sender_name", "senderName"]],
    ["Sender Country", ["sender_country", "senderCountry"]],
    ["Receiver Name", ["receiver", "receiver_name", "receiverName"]],
    ["Receiver Email", ["client_email", "receiver_email", "receiverEmail"]],
    ["Receiver Country", ["receiver_country", "receiverCountry"]],
    ["Delivery Address", ["house_address", "delivery_address", "address"]],
    ["Package Description", ["package_description", "packageDescription", "description"]],
    ["Package Weight", ["weight", "packageWeight"]]
];

    details.forEach(([label, fields]) => {
        const value = getField(data, fields, null);

        if (value === null) return;

        const paragraph = document.createElement("p");

        const strong = document.createElement("strong");
        strong.textContent = label + ":";

        const span = document.createElement("span");
        span.textContent = " " + String(value);

        paragraph.appendChild(strong);
        paragraph.appendChild(document.createElement("br"));
        paragraph.appendChild(span);

        container.appendChild(paragraph);
    });

    if (!container.children.length) {
        const message = document.createElement("p");
        message.className = "history-empty";
        message.textContent = "No additional package details have been recorded.";
        container.appendChild(message);
    }
}


// Read tracking history saved inside the shipment document.
function getShipmentHistory(data) {
    const historyFields = [
        "history",
        "trackingHistory",
        "tracking_history",
        "trackingEvents",
        "tracking_events",
        "events",
        "updates",
        "statusHistory",
        "status_history"
    ];

    for (const field of historyFields) {
        if (Array.isArray(data[field])) {
            return data[field];
        }
    }

    return [];
}


// Display all saved tracking events.
function displayTrackingHistory(data) {
    const container = document.getElementById("tracking-history-list");

    if (!container) return;

    container.innerHTML = "";

    const history = getShipmentHistory(data);

    if (!history.length) {
        const message = document.createElement("div");
        message.className = "history-empty";
        message.textContent =
            "No previous tracking updates have been saved for this shipment yet.";

        container.appendChild(message);
        return;
    }

    // Latest tracking update appears first.
    const sortedHistory = [...history].sort(
        (a, b) => getDateValue(b) - getDateValue(a)
    );

    sortedHistory.forEach(event => {
        const item = document.createElement("div");
        item.className = "history-item";

        const status = document.createElement("div");
        status.className = "history-status";
        status.textContent = getField(
            event,
            ["status", "currentStatus", "title", "event"],
            "Shipment Update"
        );

        const location = document.createElement("div");
        location.className = "history-location";

        const eventLocation = getField(
            event,
            ["location", "city", "currentLocation", "current_city_country"],
            ""
        );

        const facility = getField(
            event,
            ["facility", "current_facility", "hub"],
            ""
        );

        location.textContent = [eventLocation, facility]
            .filter(value => value && value !== "N/A")
            .join(" - ") || "Location not provided";

        const date = document.createElement("div");
        date.className = "history-date";
        date.textContent = formatDate(
            getField(
                event,
                ["date", "timestamp", "createdAt", "updatedAt", "time", "created_at"],
                null
            )
        );

        const description = document.createElement("div");
        description.className = "history-description";
        description.textContent = getField(
            event,
            ["description", "details", "message", "remarks", "note"],
            ""
        );

        item.appendChild(status);
        item.appendChild(location);
        item.appendChild(date);

        if (description.textContent) {
            item.appendChild(description);
        }

        container.appendChild(item);
    });
}


// Your original tracking function, with the history and details added.
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

        // Method 1: Check if the tracking input is the direct Document ID.
        const docRef = doc(db, "shipments", trackingInput);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            data = docSnap.data();
        } else {
            // Method 2: Query by trackingNumber or waybill.
            const q1 = query(
                collection(db, "shipments"),
                where("trackingNumber", "==", trackingInput)
            );

            let querySnapshot = await getDocs(q1);

            if (querySnapshot.empty) {
                const q2 = query(
                    collection(db, "shipments"),
                    where("waybill", "==", trackingInput)
                );

                querySnapshot = await getDocs(q2);
            }

            if (!querySnapshot.empty) {
                data = querySnapshot.docs[0].data();
            }
        }

        if (data) {
            // Original shipment summary.
            document.getElementById('res-track').innerText = trackingInput;

            document.getElementById('res-status').innerText =
                data.status || data.currentStatus || "N/A";

            document.getElementById('res-location').innerText =
                `${data.current_city_country || data.currentLocation || "N/A"} - Facility: ${data.current_facility || "N/A"}`;

            document.getElementById('res-origin').innerText =
                data.sender_country || data.originHub || "N/A";

            document.getElementById('res-destination').innerText =
                data.receiver_country || data.destinationHub || "N/A";

            document.getElementById('res-delivery').innerText =
                "Standard Transit (Stage " + (data.stage || "1") + ")";

            // Added: display all available package details.
            displayPackageDetails(data);

            // Added: display saved shipment tracking history.
            displayTrackingHistory(data);

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


// Automatically track when the page receives a tracking number.
window.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);

    const shipmentId =
        urlParams.get("tracking") ||
        urlParams.get("id");

    if (shipmentId) {
        document.getElementById("search-code").value = shipmentId;
        window.fetchShipmentDetails();
    }
});
