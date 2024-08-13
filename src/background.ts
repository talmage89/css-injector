type CallbackDetails = chrome.webNavigation.WebNavigationFramedCallbackDetails;

const listeners: ((arg0: CallbackDetails) => void)[] = [];

function autoInjectCallback(details: CallbackDetails) {
  console.log("Autoinjecting chrome wide....");
  chrome.scripting.insertCSS({
    target: { tabId: details.tabId },
    files: ["injected/injected.css"],
  });
}

function autoInjectCurrentSiteCallback(details: CallbackDetails) {
  chrome.storage.sync.get("siteUrls", (data) => {
    if (data.siteUrls.includes(new URL(details.url).origin)) {
      chrome.scripting.insertCSS({
        target: { tabId: details.tabId },
        files: ["injected/injected.css"],
      });
    }
  });
}

function toggleAutoInjectListener(newValue: CallbackDetails) {
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
    toggleAutoInjectListener(data.autoInject);
    tryAddAutoInjectCurrentSiteListener();
  });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync") {
    changes.autoInject && toggleAutoInjectListener(changes.autoInject.newValue);
    changes.siteUrls && tryAddAutoInjectCurrentSiteListener();
  }
});
