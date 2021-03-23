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

browser.runtime.onInstalled.addListener(handleInstalled);
