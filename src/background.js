// copyright 2020 conceptualspace

"use strict";

// simple polyfill for ff/chrome
window.browser = (function () {
    return window.browser || window.chrome;
})();

function handleInstalled(details) {
    if (details.reason === "install") {
        // set uninstall URL
        browser.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    }
}

// support custom plex domains
// todo: can possibly be simplified in future manifest v3, via chrome.contentScripts.register
function handleUpdated(tabId, changeInfo, tabInfo) {
    // todo: support firefox
    // tabInfo.url is only present if we have permissions for this domain (NB: url always absent on firefox without tabs perm)
    if (tabInfo.url && !tabInfo.url.startsWith("chrome")) {
        // in order to avoid executing a bunch of times, we'll run the code below which sends a message from the tab
        // back to us with the loaded status
        browser.tabs.executeScript(tabId, {
            code: "if (typeof(enhanceotronLoaded) == 'undefined') {chrome.runtime.sendMessage({ loaded: false })};"
        });
    }
}

function handleMessage(request, sender, sendResponse) {
    if (request.loaded === false) {
        chrome.tabs.executeScript({ code: "let enhanceotronLoaded = true;" }, function() {
            chrome.tabs.executeScript({ file: "/arrive.min.js"}, function() {
                browser.tabs.executeScript({ file: "/content_script.js"});
            });
        });
    }
}

browser.runtime.onMessage.addListener(handleMessage);
browser.tabs.onUpdated.addListener(handleUpdated);
browser.runtime.onInstalled.addListener(handleInstalled);
