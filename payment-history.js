document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        console.error('Member ID is missing in the URL.');
        return;
    }

    fetch('TTC Members.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets['Payment History'];

            if (!sheet) {
                console.error('Sheet "Payment History" not found in the Excel file.');
                return;
            }

            const payments = XLSX.utils.sheet_to_json(sheet, { raw: false });

            if (payments.length === 0) {
                displayNoPaymentModal();
                return;
            }

            // Filter payments for the specific member
            const memberPayments = payments.filter(payment => payment.MemberID === memberId);

            if (memberPayments.length === 0) {
                displayNoPaymentModal();
                return;
            }

            const tableBody = document.querySelector('#payment-table tbody');
            tableBody.innerHTML = ''; // Clear any existing rows

            // Create a NumberFormat instance for currency formatting
            const formatter = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            memberPayments.forEach(payment => {
                let row = document.createElement('tr');
                
                let dateCell = document.createElement('td');
                dateCell.textContent = payment.Date || 'N/A';
                row.appendChild(dateCell);
                
                let amountCell = document.createElement('td');
                let amount = parseFloat(payment.Amount) || 0;
                amountCell.textContent = formatter.format(amount);
                row.appendChild(amountCell);
                
                let descriptionCell = document.createElement('td');
                descriptionCell.textContent = payment.Description || 'N/A';
                row.appendChild(descriptionCell);
                
                tableBody.appendChild(row);
            });

            // Set the "Home" button click behavior
            document.getElementById('home-btn').onclick = function() {
                window.location.href = `index.html?id=${memberId}`;
            };
        })
        .catch(error => {
            console.error('Error fetching or processing Excel file:', error);
            displayNoPaymentModal();
        });

    function displayNoPaymentModal() {
        // Create a modal container
        let modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.borderRadius = '10px';
        modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        modal.style.textAlign = 'center';
        modal.style.zIndex = '1000';

        // Create a message element
        let message = document.createElement('p');
        message.textContent = 'NO PAYMENT RECORDED';
        message.style.fontSize = '24px';
        message.style.fontWeight = 'bold';
        message.style.margin = '0';

        // Create a button to close the modal
        let closeButton = document.createElement('button');
        closeButton.textContent = 'OK';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#007bff';
        closeButton.style.color = '#fff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';

        closeButton.onclick = function() {
            modal.remove();
            window.location.href = `index.html?id=${memberId}`;
        };

        // Append elements to the modal
        modal.appendChild(message);
        modal.appendChild(closeButton);

        // Append the modal to the body
        document.body.appendChild(modal);
    }
});
