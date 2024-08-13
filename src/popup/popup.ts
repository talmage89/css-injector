// function injectCSS() {
//   console.log("injecting css....");

//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs.length === 0) {
//       console.error("No active tab found.");
//       return;
//     }

//     chrome.scripting.insertCSS({
//       target: { tabId: tabs[0].id },
//       files: ["injected/injected.css"],
//     });
//   });
// }

function injectCSS() {
  console.log("injecting css....");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) {
      console.error("No active tab found.");
      return;
    }

    const tabId = tabs[0].id;
    if (!tabId) return;

    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: () => {
          return !!document.querySelector(".css-injected-marker");
        },
      },
      (results) => {
        if (results[0].result) {
          console.log("CSS already injected.");
          return;
        }

        chrome.scripting.insertCSS(
          {
            target: { tabId: tabId },
            files: ["injected/injected.css"],
          },
          () => {
            chrome.scripting.executeScript({
              target: { tabId: tabId },
              func: () => {
                const marker = document.createElement("div");
                marker.className = "css-injected-marker";
                marker.style.display = "none";
                document.body.appendChild(marker);
              },
            });
            console.log("CSS injection complete.");
          }
        );
      }
    );
  });
}

function removeCSS() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tabId = tabs[0].id;
    if (!tabId) return;

    chrome.scripting.removeCSS({
      target: { tabId, allFrames: true },
      files: ["injected/injected.css"],
    });
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
        const siteUrls = data.siteUrls;
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
        (autoInjectCurrentToggle.checked = data.siteUrls.includes(
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
