/**
 * ArticulusDock Content Script
 * Securely proxies save requests to the main application tab.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_ARTICLE') {
    // Check if the secure save function is available in the window
    // We use a custom event to communicate with the page script
    const event = new CustomEvent('ARTICULUSDOCK_SAVE', {
      detail: {
        url: request.url,
        title: request.title,
        excerpt: request.excerpt,
        groupId: request.groupId
      }
    });
    
    window.dispatchEvent(event);
    
    // Listen for the response from the page
    const responseHandler = (e) => {
      window.removeEventListener('ARTICULUSDOCK_SAVE_RESPONSE', responseHandler);
      sendResponse(e.detail);
    };
    
    window.addEventListener('ARTICULUSDOCK_SAVE_RESPONSE', responseHandler);
    
    return true; // Keep the message channel open for async response
  }
});
