// copyright 2020 conceptualspace

"use strict";

function handleInstalled(details) {
    if (details.reason === "install") {
        // set uninstall URL
        chrome.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    } else if (details.reason === "update") {
        const url = chrome.runtime.getURL("updated.html");
        chrome.tabs.create({ url });
    }
}

// support custom plex domains
// todo: can possibly be simplified in future manifest v3, via chrome.contentScripts.register
function handleUpdatedTab(tabId, changeInfo, tabInfo) {
    // todo: support firefox. note: url absent on firefox without tabs perm
    // tabInfo.url is only present if we have permissions for the domain, so the following only executes on relevant pages
    if (tabInfo.url && tabInfo.url.startsWith("http") && tabInfo.status === 'complete') {
        // avoid executing a bunch of times
        chrome.tabs.executeScript(tabId, {
            code: "enhanceotronLoaded"
        }, function(result) {
            if (!result[0]) {
                // load content script
                chrome.tabs.executeScript(tabId, { code: "let enhanceotronLoaded = true;" }, function() {
                    chrome.tabs.executeScript(tabId, { file: "/arrive.min.js"}, function() {
                        chrome.tabs.executeScript(tabId, { file: "/content_script.js"});
                    });
                });
            }
        });
    }
}

chrome.tabs.onUpdated.addListener(handleUpdatedTab);
chrome.runtime.onInstalled.addListener(handleInstalled);
