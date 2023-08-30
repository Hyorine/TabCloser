let blockedUrls = []; // Initialize with an empty array

// Function to load blocked URLs from chrome.storage.local
function loadBlockedUrls() {
  chrome.storage.local.get(['blockedUrls'], function (result) {
    blockedUrls = result.blockedUrls || [];
  });
}

// Load blockedUrls initially when the extension is loaded
//loadBlockedUrls();

// Function to check if a URL is in the blockedUrls list
function isUrlBlocked(url) {
  const urlHost = new URL(url).host;
  return blockedUrls.some((item) => item.url === urlHost && item.blocked === true);
}

// Add the chrome.tabs.onUpdated listener
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  loadBlockedUrls();
  if (changeInfo.url && isUrlBlocked(changeInfo.url)) {
    chrome.tabs.remove(tabId);
  }
});

// Function to update the blockedUrls in chrome.storage.local
function updateBlockedUrls(newBlockedUrls) {
  blockedUrls = newBlockedUrls;
  chrome.storage.local.set({ blockedUrls });
}

// Listen for changes to blockedUrls from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'updateBlockedUrls') {
    updateBlockedUrls(message.blockedUrls);
  }
});
