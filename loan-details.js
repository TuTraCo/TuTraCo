document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    if (!memberId) {
        console.error('Member ID is missing in the URL.');
        return;
    }

    const filePath = `Loans/${memberId}.xlsx`;

    fetch(filePath)
        .then(response => {
            if (!response.ok) {
                throw new Error('Loan file not found.');
            }
            return response.arrayBuffer();
        })
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];

            const loans = XLSX.utils.sheet_to_json(sheet, { raw: false });

            if (loans.length === 0) {
                displayNoLoanModal();
                return;
            }

            const tableBody = document.querySelector('#loan-table tbody');
            tableBody.innerHTML = ''; // Clear any existing rows

            // Create a NumberFormat instance for currency formatting
            const formatter = new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            loans.forEach((loan, index) => {
                let row = document.createElement('tr');

                let noCell = document.createElement('td');
                if (index === 0) {
                    noCell.textContent = ""; // Serial number
                } else {
                    noCell.textContent = index; // Serial number    
                }
                row.appendChild(noCell);

                let dueDateCell = document.createElement('td');
                dueDateCell.textContent = loan['Payment Date'] || '';
                row.appendChild(dueDateCell);

                let paymentDueCell = document.createElement('td');
                let paymentDue = loan['Repayment'] ? formatter.format(parseFloat(loan['Repayment'])) : '';
                paymentDueCell.textContent = paymentDue;
                row.appendChild(paymentDueCell);

                let balanceCell = document.createElement('td');
                let balance = loan['Balance'] ? formatter.format(parseFloat(loan['Balance'])) : '';
                balanceCell.textContent = balance;
                row.appendChild(balanceCell);

                let remarksCell = document.createElement('td');
                remarksCell.textContent = loan['Remark/s'] || '';
                row.appendChild(remarksCell);

                tableBody.appendChild(row);
            });

            // Set the "Home" button click behavior
            document.getElementById('home-btn').onclick = function() {
                window.location.href = `index.html?id=${memberId}`;
            };
        })
        .catch(error => {
            console.error('Error fetching or processing Excel file:', error);
            displayNoLoanModal();
        });

    function displayNoLoanModal() {
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
        message.textContent = 'NO ACTIVE LOAN';
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
