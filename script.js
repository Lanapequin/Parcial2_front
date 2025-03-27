import { URL } from "./config.js";

window.makePayment = function makePayment() {
    const userId = document.getElementById("userId").value.trim();
    const items = document.getElementById("items").value.trim();
    const totalAmount = document.getElementById("totalAmount").value.trim();
    const purchaseDate = document.getElementById("purchaseDate").value.trim();

    if (!userId || !items || !totalAmount || !purchaseDate) {
        alert("Todos los campos son obligatorios.");
        return;
    }

    let parsedItems;
    try {
        parsedItems = JSON.parse(items);
        if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
            alert("Debe ingresar al menos un artículo válido en formato JSON.");
            return;
        }
    } catch (error) {
        alert("El formato de los artículos es inválido. Asegúrese de ingresar un JSON correcto.");
        return;
    }

    if (isNaN(parseFloat(totalAmount)) || parseFloat(totalAmount) <= 0) {
        alert("El total debe ser un número mayor a 0.");
        return;
    }

    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dateRegex.test(purchaseDate)) {
        alert("La fecha debe tener el formato DD-MM-YYYY.");
        return;
    }

    const data = {
        userId,
        items: parsedItems,
        totalAmount: parseFloat(totalAmount),
        purchaseDate,
        status: "Pending",
        responseMessage: "Pago pendiente"
    };

    fetch(`${URL}/payments/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => alert("Pago registrado: " + JSON.stringify(data)))
    .catch(error => alert("Error: " + error));
}

window.getPayments = function getPayments() {
    const userId = document.getElementById("queryUserId").value.trim();

    if (!userId) {
        alert("Debe ingresar un Usuario ID para consultar los pagos.");
        return;
    }

    fetch(`${URL}/payments/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                console.log("Failed");
                throw new Error("No se pudieron obtener los pagos.");
            }
            console.log("Funciono");
            return response.json();
        })
    
        .then(data => {
            const paymentsTable = document.getElementById("paymentsTable").getElementsByTagName('tbody')[0];
            paymentsTable.innerHTML = '';
            
            if (data.length === 0) {
                alert("No hay pagos registrados para este usuario.");
                return;
            }

            data.forEach(payment => {
                const row = paymentsTable.insertRow();
                row.insertCell(0).textContent = payment.userId;
                row.insertCell(1).textContent = payment.purchaseDate;
                row.insertCell(2).textContent = `$${payment.totalAmount.toFixed(2)}`;
                row.insertCell(3).textContent = payment.status;
                row.insertCell(4).textContent = payment.responseMessage;

                const detailsCell = row.insertCell(5);
                const itemsTable = document.createElement('table');
                itemsTable.classList.add('items-table');
                
                const itemsTableHeader = itemsTable.createTHead();
                const headerRow = itemsTableHeader.insertRow();
                headerRow.insertCell(0).textContent = "Nombre";
                headerRow.insertCell(1).textContent = "Precio Unitario";
                headerRow.insertCell(2).textContent = "Cantidad";

                const itemsTableBody = itemsTable.createTBody();
                payment.items.forEach(item => {
                    const itemRow = itemsTableBody.insertRow();
                    itemRow.insertCell(0).textContent = item.name;
                    itemRow.insertCell(1).textContent = `$${item.unitPrice.toFixed(2)}`;
                    itemRow.insertCell(2).textContent = item.quantity;
                });

                detailsCell.appendChild(itemsTable);
            });
        })
        .catch(error => alert("Error: " + error.message));
}