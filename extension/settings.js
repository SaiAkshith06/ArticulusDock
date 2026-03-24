document.addEventListener('DOMContentLoaded', async () => {
  const userIdInput = document.getElementById('userId');
  const apiUrlInput = document.getElementById('apiUrl');
  const saveBtn = document.getElementById('saveBtn');
  const status = document.getElementById('status');

  // Load existing settings
  const { userId, apiUrl } = await chrome.storage.sync.get(['userId', 'apiUrl']);
  if (userId) userIdInput.value = userId;
  if (apiUrl) apiUrlInput.value = apiUrl;

  saveBtn.addEventListener('click', async () => {
    const userId = userIdInput.value.trim();
    const apiUrl = apiUrlInput.value.trim();

    if (!userId) {
      status.textContent = 'User ID is required.';
      status.style.color = '#FF4444';
      return;
    }

    await chrome.storage.sync.set({ userId, apiUrl });
    status.textContent = 'Settings saved successfully!';
    status.style.color = '#5A5A40';
    setTimeout(() => { status.textContent = ''; }, 3000);
  });
});
