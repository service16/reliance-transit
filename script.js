// Function to handle tracking lookups from the homepage
function trackShipment(event) {
    // Prevent the form from refreshing the page
    event.preventDefault();
    
    // Get the value typed into the tracking input box
    const trackingInput = document.getElementById('tracking-input').value.trim();
    
    // Check if the user left it blank
    if (trackingInput === "") {
        alert("Please enter a valid tracking number.");
        return;
    }

    // Simulate a database lookup for the shipment
    // (You can later connect this to a real backend database API)
    alert(`🔍 Tracking Lookup: ${trackingInput}\n\nStatus: IN TRANSIT ✈️\nLocation: Air Cargo Hub / En Route\nEstimated Delivery: Within 48 Hours`);
    
    // Optional: clear the input field after searching
    document.getElementById('tracking-input').value = "";
}
