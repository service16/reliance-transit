document.addEventListener('DOMContentLoaded', loadAdminShipments);

async function createNewShipment(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('track-no').value.trim();
    const senderName = document.getElementById('sender').value.trim();
    const receiverName = document.getElementById('receiver').value.trim();
    const origin = document.getElementById('origin').value.trim();
    const destination = document.getElementById('destination').value.trim();
    const status = document.getElementById('status').value;
    const currentLocation = document.getElementById('curr-loc').value.trim();
    const estimatedDelivery = document.getElementById('est-deliv').value.trim();

    const { data, error } = await supabase
        .from('shipments')
        .insert([{
            tracking_number: trackingNumber,
            sender_name: senderName,
            receiver_name: receiverName,
            origin: origin,
            destination: destination,
            status: status,
            current_location: currentLocation,
            estimated_delivery: estimatedDelivery
        }]);

    if (error) {
        alert("Failed to save: " + error.message);
        console.error("Supabase Error Details:", error);
    } else {
        alert("Shipment created successfully!");
        document.getElementById('create-shipment-form').reset();
        loadAdminShipments();
    }
}

async function loadAdminShipments() {
    const tableBody = document.getElementById('shipments-table-body');
    if (!tableBody) return;

    const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('tracking_number', { ascending: false });

    if (error) {
        console.error("Error loading shipments:", error.message);
        tableBody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #dc2626;">Error loading data: ${error.message}</td></tr>`;
        return;
    }

    tableBody.innerHTML = '';
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="padding: 20px; text-align: center; color: #64748b;">No shipments found in database. Create one above!</td></tr>`;
        return;
    }

    data.forEach(shipment => {
        tableBody.innerHTML += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px; font-weight: 600; color: #0b1d3a;">${shipment.tracking_number}</td>
                <td style="padding: 12px;">${shipment.receiver_name}</td>
                <td style="padding: 12px;"><span style="background: #e0f2fe; color: #0369a1; padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 600;">${shipment.status}</span></td>
                <td style="padding: 12px;">${shipment.current_location}</td>
                <td style="padding: 12px;">
                    <button type="button" onclick="updateStatusPrompt('${shipment.tracking_number}')" style="background: #0284c7; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Update</button>
                </td>
            </tr>
        `;
    });
}

async function updateStatusPrompt(trackingNumber) {
    const newStatus = prompt("Enter new status (e.g., In Air Transit, Out for Delivery, Delivered):");
    const newLocation = prompt("Enter current location description:");

    if (!newStatus || !newLocation) return;

    const { error } = await supabase
        .from('shipments')
        .update({ status: newStatus, current_location: newLocation })
        .eq('tracking_number', trackingNumber);

    if (error) {
        alert("Update failed: " + error.message);
    } else {
        alert("Shipment status updated successfully!");
        loadAdminShipments();
    }
}
