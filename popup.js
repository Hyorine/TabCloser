document.addEventListener('DOMContentLoaded', function () {
  const urlTableBody = document.getElementById('urlTable').getElementsByTagName('tbody')[0];
  const addForm = document.getElementById('addForm');
  const urlInput = document.getElementById('url');
  const blockedInput = document.getElementById('blocked');

  // Function to add a URL to the table
  function addUrlToTable(url, blocked) {
    const newRow = urlTableBody.insertRow();

    const urlCell = newRow.insertCell();
    urlCell.textContent = url;

    const blockedCell = newRow.insertCell();
    blockedCell.textContent = blocked ? 'Blocked' : 'Enabled';

    const modalityCell = newRow.insertCell();
    const modalityButton = document.createElement('button');
    modalityButton.textContent = 'Change Modality';
    modalityButton.addEventListener('click', () => {
      chrome.storage.local.get(['blockedUrls'], function (result) {
        const blockedUrls = result.blockedUrls || [];
        const existingUrlIndex = blockedUrls.findIndex((item) => item.url === url);

        if (existingUrlIndex !== -1) {
          blockedUrls[existingUrlIndex].blocked = !blockedUrls[existingUrlIndex].blocked;
          blockedCell.textContent = blockedUrls[existingUrlIndex].blocked ? 'Blocked' : 'Enabled';
          chrome.storage.local.set({ blockedUrls });
        }
      });
    });

    modalityCell.appendChild(modalityButton);
  }

  // Function to load blocked URLs from chrome.storage.local
  function loadBlockedUrls() {
    chrome.storage.local.get(['blockedUrls'], function (result) {
      const blockedUrls = result.blockedUrls || [];
      blockedUrls.forEach(({ url, blocked }) => {
        addUrlToTable(url, blocked);
      });
    });
  }

  // Load blocked URLs initially when the popup is opened
  loadBlockedUrls();

  // Function to handle the form submission
  function handleSubmit(event) {
    event.preventDefault();
    const url = urlInput.value.trim();
    const blocked = blockedInput.checked;

    if (url) {
      chrome.storage.local.get(['blockedUrls'], function (result) {
        const blockedUrls = result.blockedUrls || [];
        const existingUrlIndex = blockedUrls.findIndex((item) => item.url === url);

        if (existingUrlIndex !== -1) {
          blockedUrls[existingUrlIndex].blocked = blocked;
          const rowToUpdate = urlTableBody.rows[existingUrlIndex];
          rowToUpdate.cells[1].textContent = blocked ? 'Blocked' : 'Enabled';
        } else {
          blockedUrls.push({ url, blocked });
          addUrlToTable(url, blocked);
        }

        chrome.storage.local.set({ blockedUrls });
      });
    }

    urlInput.value = '';
    blockedInput.checked = false;
  }

  // Add event listener for form submission
  addForm.addEventListener('submit', handleSubmit);
});
