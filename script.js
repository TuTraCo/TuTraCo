document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const memberId = urlParams.get('id');

    document.getElementById('payment-history-btn').onclick = function() {
        window.location.href = `payment-history.html?id=${memberId}`;
    };

    document.getElementById('loans-btn').onclick = function() {
        window.location.href = `loan-details.html?id=${memberId}`;
    };

    // Function to check if a file exists
    function fileExists(url) {
        return fetch(url, { method: 'HEAD' })
            .then(response => response.ok)
            .catch(() => false);
    }

    fetch('TTC Members.xlsx')
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets['Members'];
            const members = XLSX.utils.sheet_to_json(sheet, { raw: false });

            const member = members.find(m => m.MemberID == memberId);
            
            if (member) {
                let infoDiv = document.getElementById('info');
                for (let key in member) {
                    let cellRef = XLSX.utils.encode_cell({ c: Object.keys(member).indexOf(key), r: members.indexOf(member) });
                    let cell = sheet[cellRef];

                    let rowDiv = document.createElement('div');
                    rowDiv.classList.add('info-row');

                    let keySpan = document.createElement('span');
                    keySpan.classList.add('key');
                    keySpan.textContent = `${key}:`;

                    let valueSpan = document.createElement('span');
                    valueSpan.classList.add('value');
                    let cellValue = member[key];

                    if (cell && cell.s) {
                        let style = cell.s;
                        
                        if (style.font && style.font.bold) {
                            keySpan.style.fontWeight = 'bold';
                        }
                        
                        if (style.numFmt && style.numFmt.includes('₱')) {
                            cellValue = `₱${cellValue}`;
                        }
                    }

                    valueSpan.textContent = cellValue;

                    rowDiv.appendChild(keySpan);
                    rowDiv.appendChild(valueSpan);
                    infoDiv.appendChild(rowDiv);
                }

                // Display the member's photo
                let photoPath = `ID_Photos/${memberId}.jpeg`;
                let jpgPath = `ID_Photos/${memberId}.jpg`;
                let photoElement = document.getElementById('member-photo');

                fileExists(photoPath)
                    .then(exists => {
                        if (exists) {
                            photoElement.src = photoPath;
                            photoElement.style.display = 'block';
                        } else {
                            return fileExists(jpgPath);
                        }
                    })
                    .then(exists => {
                        if (exists) {
                            photoElement.src = jpgPath;
                            photoElement.style.display = 'block';
                        } else {
                            photoElement.style.display = 'none';
                        }
                    })
                    .catch(error => {
                        console.error('Error checking file existence:', error);
                        photoElement.style.display = 'none';
                    });

            } else {
                alert('Member not found');
            }
        })
        .catch(error => console.error(error));
});
