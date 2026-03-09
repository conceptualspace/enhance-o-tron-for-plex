// copyright 2020 conceptualspace

"use strict";

const isFirefox = typeof browser !== 'undefined';
const api = isFirefox ? browser : chrome;

function handleInstalled(details) {
    if (details.reason === "install") {
        // set uninstall URL
        api.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    } else if (details.reason === "update" && details.previousVersion === "1.4.0") {
        const url = api.runtime.getURL("updated.html");
        api.tabs.create({ url });
    }
}

// support custom plex domains
function handleUpdatedTab(tabId, changeInfo, tabInfo) {
    if (tabInfo.url && tabInfo.url.startsWith("http") && changeInfo.status === 'complete') {
        api.permissions.contains({
            origins: [new URL(tabInfo.url).origin + "/*"]
        }, function(permissions) {
            if (permissions) {
                // avoid executing a bunch of times
                api.scripting.executeScript({
                    target: { tabId: tabId },
                    func: () => typeof window.enhanceotronLoaded !== 'undefined' ? window.enhanceotronLoaded : false
                }).then((results) => {
                    const isLoaded = results && results[0] && results[0].result;
                    if (!isLoaded) {
                        api.scripting.executeScript({
                            target: { tabId: tabId },
                            func: () => { window.enhanceotronLoaded = true; }
                        }).then(() => {
                            api.scripting.executeScript({
                                target: { tabId: tabId },
                                files: ["/arrive.min.js"]
                            }).then(() => {
                                api.scripting.executeScript({
                                    target: { tabId: tabId },
                                    files: ["/content_script.js"]
                                });
                            });
                        });
                    }
                }).catch((err) => {
                    // Ignore errors where we can't inject
                });
            }
        });
    }
}

api.tabs.onUpdated.addListener(handleUpdatedTab);
api.runtime.onInstalled.addListener(handleInstalled);
