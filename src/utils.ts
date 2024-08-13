export function insertCss(tabs: chrome.tabs.Tab[]) {
  const tabId = tabs[0]?.id;
  if (!tabId) return;

  chrome.scripting.insertCSS(
    { target: { tabId }, files: ["injected.css"] },
    () => {
      chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
          const marker = document.createElement("div");
          marker.className = "css-injected-marker";
          marker.style.display = "none";
          document.body.appendChild(marker);
        },
      });
    }
  );
}
