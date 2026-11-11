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
    apiKey: "AIzaSyBTBGEI8d_f8Ti4TI7hW9ASC4PEdf5la4A",
    authDomain: "reliance-transit.firebaseapp.com",
    projectId: "reliance-transit",
    storageBucket: "reliance-transit.firebasestorage.app",
    messagingSenderId: "1074202809376",
    appId: "1:1074202809376:web:19cfad7b2a4fb8a4245845",
    measurementId: "G-2Y0TD1DV59"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// Get the first available value from possible field names.
function getValue(data, fields, fallback = "N/A") {
    for (const field of fields) {
        const value = data?.[field];

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return fallback;
}


// Convert Firestore timestamps and date values into readable dates.
function formatDate(value) {
    if (!value) return "Date not provided";

    let date;

    if (value?.toDate && typeof value.toDate === "function") {
        date = value.toDate();
    } else if (typeof value === "object" && value.seconds) {
        date = new Date(value.seconds * 1000);
    } else {
        date = new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


// Safely display text without interpreting it as HTML.
function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = value ?? "N/A";
    }
}


// Find the shipment in Firestore.
async function findShipment(trackingNumber) {

    // Method 1: Search by document ID.
    const directRef = doc(db, "shipments", trackingNumber);
    const directSnapshot = await getDoc(directRef);

    if (directSnapshot.exists()) {
        return {
            id: directSnapshot.id,
            ...directSnapshot.data()
        };
    }

    // Method 2: Search by trackingNumber field.
    const trackingQuery = query(
        collection(db, "shipments"),
        where("trackingNumber", "==", trackingNumber)
    );

    const trackingResults = await getDocs(trackingQuery);

    if (!trackingResults.empty) {
        const result = trackingResults.docs[0];

        return {
            id: result.id,
            ...result.data()
        };
    }

    // Method 3: Search by waybill field.
    const waybillQuery = query(
        collection(db, "shipments"),
        where("waybill", "==", trackingNumber)
    );

    const waybillResults = await getDocs(waybillQuery);

    if (!waybillResults.empty) {
        const result = waybillResults.docs[0];

        return {
            id: result.id,
            ...result.data()
        };
    }

    return null;
}


// Display additional package information.
function displayPackageDetails(data) {

    const container = document.getElementById("extra-details");
    container.replaceChildren();

    const details = [
        ["Sender Name", ["sender_name", "senderName", "sender"]],
        ["Sender Email", ["sender_email", "senderEmail"]],
        ["Sender Phone", ["sender_phone", "senderPhone"]],
        ["Receiver Name", ["receiver_name", "receiverName", "recipient"]],
        ["Receiver Email", ["receiver_email", "receiverEmail"]],
        ["Receiver Phone", ["receiver_phone", "receiverPhone"]],
        ["Package Description", ["package_description", "packageDescription", "description"]],
        ["Package Type", ["package_type", "packageType"]],
        ["Weight", ["weight", "packageWeight"]],
        ["Shipping Method", ["shipping_method", "shippingMethod", "serviceType"]],
        ["Payment Status", ["paymentStatus", "payment_status"]],
        ["Last Updated", ["updatedAt", "lastUpdated", "updated_at"]]
    ];

    details.forEach(([label, fields]) => {

        const value = getValue(data, fields, null);

        if (value === null) return;

        const item = document.createElement("div");
        item.className = "detail-item";

        const heading = document.createElement("strong");
        heading.textContent = label;

        const content = document.createElement("div");
        content.textContent = label === "Last Updated"
            ? formatDate(value)
            : String(value);

        item.appendChild(heading);
        item.appendChild(content);

        container.appendChild(item);
    });

    if (!container.children.length) {
        const message = document.createElement("p");
        message.className = "history-empty";
        message.textContent = "No additional package details have been recorded.";
        container.appendChild(message);
    }
}


// Find the saved tracking history array.
function getTrackingHistory(data) {

    const possibleFields = [
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

    for (const field of possibleFields) {

        if (Array.isArray(data[field])) {
            return data[field];
        }
    }

    return [];
}


// Display shipment history as a chronological timeline.
function displayTrackingHistory(data) {

    const container = document.getElementById("tracking-history");
    container.replaceChildren();

    const history = getTrackingHistory(data);

    if (!history.length) {

        const message = document.createElement("div");
        message.className = "history-empty";

        message.textContent =
            "No previous tracking history has been recorded for this shipment. The current shipment status is shown above.";

        container.appendChild(message);
        return;
    }

    // Sort events from oldest to newest.
    const sortedHistory = [...history].sort((a, b) => {

        const dateA = getEventDate(a);
        const dateB = getEventDate(b);

        return dateA - dateB;
    });

    const timeline = document.createElement("div");
    timeline.className = "timeline";

    sortedHistory.forEach((event) => {

        const item = document.createElement("div");
        item.className = "timeline-item";

        const dot = document.createElement("div");
        dot.className = "timeline-dot";

        const status = document.createElement("div");
        status.className = "timeline-status";
        status.textContent = getValue(
            event,
            ["status", "currentStatus", "title", "event"],
            "Shipment Update"
        );

        const location = document.createElement("div");
        location.className = "timeline-location";

        const city = getValue(
            event,
            ["location", "city", "currentLocation", "current_city_country"],
            ""
        );

        const facility = getValue(
            event,
            ["facility", "current_facility", "hub"],
            ""
        );

        location.textContent = [city, facility]
            .filter(value => value && value !== "N/A")
            .join(" - ") || "Location not provided";

        const date = document.createElement("div");
        date.className = "timeline-date";

        date.textContent = formatDate(
            getValue(
                event,
                ["date", "timestamp", "createdAt", "updatedAt", "time", "created_at"],
                null
            )
        );

        const description = document.createElement("div");
        description.className = "timeline-description";

        description.textContent = getValue(
            event,
            ["description", "details", "message", "remarks", "note"],
            ""
        );

        item.appendChild(dot);
        item.appendChild(status);
        item.appendChild(location);
        item.appendChild(date);

        if (description.textContent) {
            item.appendChild(description);
        }

        timeline.appendChild(item);
    });

    container.appendChild(timeline);
}


// Convert an event date into a sortable timestamp.
function getEventDate(event) {

    const value = getValue(
        event,
        ["date", "timestamp", "createdAt", "updatedAt", "time", "created_at"],
        null
    );

    if (!value) return 0;

    if (value?.toDate && typeof value.toDate === "function") {
        return value.toDate().getTime();
    }

    if (typeof value === "object" && value.seconds) {
        return value.seconds * 1000;
    }

    const date = new Date(value).getTime();

    return Number.isNaN(date) ? 0 : date;
}


// Show the shipment summary.
function displayShipment(data, searchedNumber) {

    setText("res-track", getValue(
        data,
        ["trackingNumber", "waybill"],
        searchedNumber
    ));

    setText("res-status", getValue(
        data,
        ["status", "currentStatus"],
        "N/A"
    ));

    const currentLocation = getValue(
        data,
        ["current_city_country", "currentLocation"],
        "N/A"
    );

    setText("res-location", currentLocation);

    setText("res-facility", getValue(
        data,
        ["current_facility", "currentFacility"],
        "N/A"
    ));

    setText("res-origin", getValue(
        data,
        ["sender_country", "originHub", "origin"],
        "N/A"
    ));

    setText("res-destination", getValue(
        data,
        ["receiver_country", "destinationHub", "destination"],
        "N/A"
    ));

    setText("res-delivery", getValue(
        data,
        ["estimatedDelivery", "estimated_delivery", "deliveryDate"],
        "Not yet provided"
    ));

    setText("res-stage", getValue(
        data,
        ["stage", "shipmentStage"],
        "N/A"
    ));

    displayPackageDetails(data);
    displayTrackingHistory(data);

    document.getElementById("result-container").style.display = "block";
    document.getElementById("not-found-container").style.display = "none";
}


// Show a message on the tracking page.
function showMessage(message, type) {

    const element = document.getElementById("tracking-message");

    element.textContent = message;
    element.className = "tracking-message " + type;
    element.style.display = "block";
}


// Main tracking function.
window.fetchShipmentDetails = async function() {

    const trackingInput = document
        .getElementById("search-code")
        .value
        .trim();

    const resultContainer = document.getElementById("result-container");
    const notFoundContainer = document.getElementById("not-found-container");
    const button = document.getElementById("track-button");

    if (!trackingInput) {
        alert("Please enter a valid tracking number.");
        return;
    }

    resultContainer.style.display = "none";
    notFoundContainer.style.display = "none";

    showMessage("Searching for your shipment...", "tracking-loading");

    button.disabled = true;
    button.textContent = "Searching...";

    try {

        const shipment = await findShipment(trackingInput);

        if (shipment) {

            displayShipment(shipment, trackingInput);

            document.getElementById("tracking-message").style.display = "none";

        } else {

            resultContainer.style.display = "none";
            notFoundContainer.style.display = "block";

            document.getElementById("tracking-message").style.display = "none";
        }

    } catch (error) {

        console.error("Firestore Error:", error);

        showMessage(
            "Unable to retrieve shipment information. Please try again.",
            "tracking-error"
        );

    } finally {

        button.disabled = false;
        button.textContent = "Track Package";
    }
};


// Form submission.
document.getElementById("tracking-form").addEventListener("submit", function(event) {

    event.preventDefault();

    window.fetchShipmentDetails();
});


// Automatically search when opened from the homepage.
window.addEventListener("DOMContentLoaded", function() {

    const urlParams = new URLSearchParams(window.location.search);

    // Supports the homepage's ?tracking= format and the older ?id= format.
    const shipmentId =
        urlParams.get("tracking") ||
        urlParams.get("id");

    if (shipmentId) {

        document.getElementById("search-code").value = shipmentId;

        window.fetchShipmentDetails();
    }
});
