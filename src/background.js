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

chrome.runtime.onInstalled.addListener(handleInstalled);
