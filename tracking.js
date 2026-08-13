async function fetchShipmentDetails() {
    const trackingCode = document.getElementById('search-code').value.trim();
    const resultCard = document.getElementById('result-container');

    if (!trackingCode) {
        alert("Please enter a valid tracking number.");
        return;
    }

    // Query Supabase for the tracking number
    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingCode)
        .single();

    if (error || !data) {
        alert("Shipment not found. Please check your tracking number and try again.");
        resultCard.style.display = 'none';
        return;
    }

    // Populate data into the HTML elements
    document.getElementById('res-track').innerText = data.tracking_number;
    document.getElementById('res-status').innerText = data.status;
    document.getElementById('res-location').innerText = data.current_location;
    document.getElementById('res-origin').innerText = data.origin;
    document.getElementById('res-destination').innerText = data.destination;
    document.getElementById('res-delivery').innerText = data.estimated_delivery;

    // Show the result card
    resultCard.style.display = 'block';
}
