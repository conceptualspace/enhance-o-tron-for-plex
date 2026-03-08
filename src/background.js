// copyright 2020 conceptualspace

"use strict";

function permissionsContains(origins) {
    return new Promise((resolve) => {
        chrome.permissions.contains({ origins }, resolve);
    });
}

async function shouldInjectForUrl(url) {
    if (!url || !url.startsWith("http")) {
        return false;
    }

    const originPattern = new URL(url).origin + "/*";
    return permissionsContains([originPattern]);
}

async function isEnhanceotronLoaded(tabId) {
    try {
        const result = await chrome.scripting.executeScript({
            target: { tabId },
            func: () => Boolean(globalThis.enhanceotronLoaded)
        });

        return Boolean(result && result[0] && result[0].result);
    } catch (err) {
        // Ignore transient tab states and injection failures.
        return true;
    }
}

async function injectEnhanceotron(tabId) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: () => {
            globalThis.enhanceotronLoaded = true;
        }
    });

    await chrome.scripting.executeScript({
        target: { tabId },
        files: ["arrive.min.js", "content_script.js"]
    });
}

function handleInstalled(details) {
    if (details.reason === "install") {
        chrome.runtime.setUninstallURL("https://forms.gle/JqMEogANnkktEtSR9");
    } else if (details.reason === "update" && details.previousVersion === "1.4.0") {
        chrome.tabs.create({ url: chrome.runtime.getURL("updated.html") });
    }
}

async function handleUpdatedTab(tabId, changeInfo, tab) {
    if (changeInfo.status !== "complete") {
        return;
    }

    if (!(await shouldInjectForUrl(tab && tab.url))) {
        return;
    }

    if (await isEnhanceotronLoaded(tabId)) {
        return;
    }

    await injectEnhanceotron(tabId);
}

chrome.runtime.onInstalled.addListener(handleInstalled);
chrome.tabs.onUpdated.addListener(handleUpdatedTab);
