document.addEventListener('DOMContentLoaded', async () => {
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  saveBtn.addEventListener('click', async () => {
    saveBtn.disabled = true;
    status.textContent = 'Saving...';

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const { apiUrl } = await chrome.storage.sync.get(['apiUrl']);

    // Find the ArticulusDock tab to proxy the request
    const tabs = await chrome.tabs.query({ url: "*://*.run.app/*" });
    const appTab = tabs.find(t => t.url.includes('run.app') || t.url.includes('localhost') || t.url.includes('vercel.app'));

    if (!appTab) {
      status.textContent = 'ArticulusDock dashboard must be open in a tab.';
      saveBtn.disabled = false;
      return;
    }

    try {
      chrome.tabs.sendMessage(appTab.id, {
        type: 'SAVE_ARTICLE',
        url: tab.url,
        title: tab.title,
        excerpt: "Saved from ArticulusDock Extension"
      }, (response) => {
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: Make sure the dashboard tab is active.';
          saveBtn.disabled = false;
          return;
        }

        if (response && response.success) {
          status.textContent = 'Article saved successfully!';
          setTimeout(() => window.close(), 1500);
        } else {
          status.textContent = 'Error: ' + (response?.error || 'Failed to save');
          saveBtn.disabled = false;
        }
      });
    } catch (error) {
      console.error('Save error:', error);
      status.textContent = 'Network error. Check settings.';
      saveBtn.disabled = false;
    }
  });
});
