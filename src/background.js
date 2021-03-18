// copyright 2020 conceptualspace

"use strict";

function handleInstalled(details) {
    if (details.reason === "install") {
        // set uninstall URL
        browser.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    }
}

browser.runtime.onInstalled.addListener(handleInstalled);
