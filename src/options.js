// copyright 2020 conceptualspace

"use strict";

let url = null;
let tabId = null;

function getUrl(tabs) {
    tabId = tabs[0].id;
    if (tabs[0].url && tabs[0].url.startsWith("http")) {
        url = new URL(tabs[0].url).origin + "/*";
        checkPermissions(url);
    } else {
        window.close();
    }
}

function checkPermissions() {
    chrome.permissions.contains({
        origins: [url]
    }, function(result) {
        if (result) {
            document.getElementById("enabled").style.display = "block";
        } else {
            document.getElementById("disabled").style.display = "block";
        }
    });
}

function saveOptions(e) {
    e.preventDefault();

    chrome.permissions.request({
        origins: [url]
    }, function(granted) {
        if (granted) {
            chrome.tabs.reload(tabId);
            window.close();
        } else {
            document.getElementById("error").style.display = "block";
        }
    });
}

chrome.tabs.query({ active: true, currentWindow: true }, getUrl);

document.getElementById('option-no').addEventListener("click", function() {window.close();});
document.getElementById('option-yes').addEventListener("click", saveOptions);
