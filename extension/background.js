chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Redirect to the Lumina website upon installation
    chrome.tabs.create({
      url: "https://ais-dev-savhgc5cgg74jr7ahe4onr-471225792982.asia-southeast1.run.app"
    });
  }
});
