// copyright 2020 conceptualspace

"use strict";

function handleInstalled(details) {
    if (details.reason === "install") {
        // set uninstall URL
        chrome.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    } else if (details.reason === "update" && details.previousVersion === "1.4.0") {
        const url = chrome.runtime.getURL("updated.html");
        chrome.tabs.create({ url });
    }
}

// support custom plex domains
// in firefox, we require the tabs permission to access tab url, then we check it for permissions.
// in chrome, we can avoid the tabs permission, as chrome will return the tab url for permitted domains. so we get the permissions check for free
function handleUpdatedTab(tabId, changeInfo, tabInfo) {
    // firefox
    if (window.browser && tabInfo.url && tabInfo.url.startsWith("http") && changeInfo.status === 'complete') {
            chrome.permissions.contains({
                origins: [new URL(tabInfo.url).origin + "/*"]
            }, function(permissions) {
                if (permissions) {
                    // avoid executing a bunch of times
                    // NB: we use chrome namespace elsewhere typically since its cross compatible, but this API is an exception
                    // NB2: chrome namespace uses callbacks but browser namespace uses promises
                    browser.tabs.executeScript(tabId, {code: "enhanceotronLoaded"}).catch((err) => {
                        // "enhanceotronLoaded" is undefined, inject script
                        browser.tabs.executeScript(tabId, { code: "let enhanceotronLoaded = true;" }).then((result) => {
                            chrome.tabs.executeScript(tabId, {file: "/arrive.min.js"}, function () {
                                chrome.tabs.executeScript(tabId, {file: "/content_script.js"});
                            });
                        })
                            .catch((err) => {
                                // enhanceotron already loaded
                                return;
                            });
                    })
                }
            });
    }
    // chrome
    // !!! be sure TABS permission is NOT in manifest (otherwise code below executes on every page and will throw error. see note above)
    else if (!window.browser && tabInfo.url && tabInfo.url.startsWith("http") && changeInfo.status === 'complete') {
        // avoid executing a bunch of times
        chrome.tabs.executeScript(tabId, {
            code: "enhanceotronLoaded"
        }, function(result) {
            if (result && !result[0]) {
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
