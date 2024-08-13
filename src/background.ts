import { insertCss } from "./utils";

const listeners: ((...args: any[]) => any)[] = [];

function autoInjectCallback() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    insertCss(tabs);
  });
}

function autoInjectCurrentSiteCallback(
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails
) {
  chrome.storage.sync.get("siteUrls", (data) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      data.siteUrls?.includes(new URL(details.url).origin) && insertCss(tabs);
    });
  });
}

function toggleAutoInjectListener(newValue: boolean) {
  if (newValue) {
    if (listeners.includes(autoInjectCallback)) return;
    chrome.webNavigation.onCompleted.addListener(autoInjectCallback, {
      url: [{ urlMatches: ".*" }],
    });
    listeners.push(autoInjectCallback);
  } else {
    chrome.webNavigation.onCompleted.removeListener(autoInjectCallback);
  }
}

function tryAddAutoInjectCurrentSiteListener() {
  if (listeners.includes(autoInjectCurrentSiteCallback)) return;
  chrome.webNavigation.onCompleted.addListener(autoInjectCurrentSiteCallback, {
    url: [{ urlMatches: ".*" }],
  });
  listeners.push(autoInjectCurrentSiteCallback);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(["autoInject"], (data) => {
    toggleAutoInjectListener(data.autoInject.newValue);
    tryAddAutoInjectCurrentSiteListener();
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    changes.autoInject && toggleAutoInjectListener(changes.autoInject.newValue);
    changes.siteUrls && tryAddAutoInjectCurrentSiteListener();
  }
});
