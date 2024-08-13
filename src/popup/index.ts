import { insertCss } from "../utils";

function injectCSS() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0]?.id;
    if (!tabId) return;

    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => !!document.querySelector(".css-injected-marker"),
      },
      (results) => {
        if (results[0].result) return;
        insertCss(tabs);
      }
    );
  });
}

function removeCSS() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    if (!tabId) return;

    chrome.scripting.removeCSS(
      {
        target: { tabId, allFrames: true },
        files: ["injected.css"],
      },
      () => {
        chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            const markers = document.querySelectorAll(
              ".css-injected-marker"
            );
            for (let i = 0; i < markers.length; i++) {
              markers[i].remove();
            }
          },
        });
      }
    );
  });
}

function toggleAutoInject(event: Event) {
  const autoInject = (event.target as HTMLInputElement).checked;
  chrome.storage.sync.set({ autoInject: autoInject });
}

function toggleAutoInjectCurrentSite(event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  if (checked) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabUrl = tabs[0].url;
      if (!tabUrl) return;
      const siteUrl = new URL(tabUrl).origin;
      chrome.storage.sync.get({ siteUrls: [] }, (data) => {
        const siteUrls = data.siteUrls || [];
        if (!siteUrls.includes(siteUrl)) {
          siteUrls.push(siteUrl);
        }
        chrome.storage.sync.set({ siteUrls: siteUrls });
      });
    });
  } else {
    chrome.storage.sync.get({ siteUrls: [] }, (data) => {
      const siteUrls = data.siteUrls;
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabUrl = tabs[0].url;
        if (!tabUrl) return;
        const siteUrl = new URL(tabUrl).origin;
        const updatedSiteUrls = siteUrls.filter(
          (url: string) => url !== siteUrl
        );
        chrome.storage.sync.set({ siteUrls: updatedSiteUrls });
      });
    });
  }
}

function loadAutoInjectState() {
  chrome.storage.sync.get(["autoInject", "siteUrls"], (data) => {
    const autoInjectToggle = document.getElementById(
      "toggleAutoInject"
    ) as HTMLInputElement;
    if (autoInjectToggle) {
      autoInjectToggle.checked = data.autoInject || false;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const autoInjectCurrentToggle = document.getElementById(
        "toggleAutoInjectCurrentSite"
      ) as HTMLInputElement;

      const tabUrl = tabs[0].url;
      tabUrl &&
        (autoInjectCurrentToggle.checked = data.siteUrls?.includes(
          new URL(tabUrl).origin
        ));
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("injectCss")?.addEventListener("click", injectCSS);
  document.getElementById("removeCss")?.addEventListener("click", removeCSS);
  document
    .getElementById("toggleAutoInject")
    ?.addEventListener("change", toggleAutoInject);
  document
    .getElementById("toggleAutoInjectCurrentSite")
    ?.addEventListener("change", toggleAutoInjectCurrentSite);

  loadAutoInjectState();
});
