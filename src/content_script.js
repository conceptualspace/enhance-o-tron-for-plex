// copyright 2020 conceptualspace

"use strict";

// todo: fix this
let enhanceotronAudioCtx, compressor, source, compressorActive, libraryType;

// TRAILERS //

function createTrailerElem(title, year, margin) {
    let trailer = document.createElement('a');
    trailer.setAttribute("id", "enhanceotron-trailer");
    trailer.setAttribute('href',"https://www.youtube.com/results?search_query="+title+"+"+year+"+trailer");
    trailer.setAttribute('target',"_blank");
    if (margin) {
        trailer.style.marginLeft = '10px';
       // todo: clone styles
       // trailer.style.fontSize = 'var(--font-body-2-font-size)';
    }
    trailer.innerText = chrome.i18n.getMessage("playTrailer");
    return trailer;

    // todo: embedded mode
    // $.get( "https://www.youtube.com/results?search_query=movie+trailer", function( data ) { $( ".result" ).html( data ); });
}

// Plex v3.x
document.arrive("div[data-qa-id='preplaySecondTitle']", function() {
    if (!document.getElementById('enhanceotron-trailer')) {
        let title = document.querySelector("div[data-qa-id='preplayMainTitle']").textContent;
        let year = document.querySelector("div[data-qa-id='preplaySecondTitle'] .PrePlayLeftTitle-leftTitle-Ev1KGW").textContent;
        if (document.querySelector('.PrePlayMetadataInnerContent-innerContent-1BPzwp')) {
            document.querySelector('.PrePlayMetadataInnerContent-innerContent-1BPzwp').appendChild(createTrailerElem(title, year, false));
        }
    }
});

// Plex v4.x
document.arrive("div[data-qa-id='preplay-secondTitle']", function() {
    if (!document.getElementById('enhanceotron-trailer')) {
        let title = document.querySelector("div[data-qa-id='preplay-mainTitle']").textContent;
        let year = document.querySelector("div[data-qa-id='preplay-secondTitle']").textContent;
        // tested from v4.54.x - v4.60.x
        let titleNode = document.querySelector("div[data-qa-id='preplay-thirdTitle']");
        if (titleNode) {
            titleNode.appendChild(createTrailerElem(title, year, true));
        }
    }
});

// Plex v4.64.x
// data-qa-id -> data-testid
document.arrive("div[data-testid='preplay-thirdTitle']", function() {
    if (!document.getElementById('enhanceotron-trailer')) {
        let title = document.querySelector("div[data-testid='preplay-mainTitle']")?.textContent;
        let year = document.querySelector("div[data-testid='preplay-secondTitle']") ? 
            document.querySelector("div[data-testid='preplay-secondTitle']")?.textContent :
            document.querySelector("div[data-testid='preplay-mainTitle']")?.nextSibling?.firstChild?.textContent;
        // tested from v4.54.x - v4.94.2
        let titleNode = document.querySelector("div[data-testid='preplay-thirdTitle']");
        if (titleNode) {
            titleNode.appendChild(createTrailerElem(title, year, true));
        }
    }
});

// LIBRARY SHUFFLE //

function updateUrl() {
    // plex url is totally mangled. thanks interns
    const url = window.location.href;
    const source = url.slice(url.indexOf('source=') + 7).split('&')[0];

    let newUrl = '';

    // each library has a key which must be included to make url queries
    // the key is in the form "library\sections" plus the source" param. ex: library\sections\25
    if (url.includes('key=')) {
        if (url.includes('sort=')) {
            // just need to replace the sort param (original method)
            const nonParams = url.slice(0, url.indexOf('?') + 1);
            const params = url.slice(url.indexOf('?') + 1).split('&');

            let newParams = params.map(function(param) {
                if (param.includes('sort=')) {
                    return ''
                } else {
                    return param
                }
            }).join('&');
            newParams += "&sort=random";
            newUrl = nonParams + newParams;
        } else if (url.includes('sort%3D')) {
            // replace the sort string
            const currentSort = url.slice(url.indexOf('sort%3D') + 7).split('%26')[0];
            // hack to refresh inline
            if (currentSort === 'random') {
                newUrl = url.replace(currentSort, 'random%253Adesc')
            } else {
                newUrl = url.replace(currentSort, 'random')
            }
        } else {
            newUrl = url + "&sort=random";
        }
    } else {
        // append key and search
        const keyParam = "&key=%2Flibrary%2Fsections%2F" + source + "%2Fall";
        const typeParam = "%3Ftype%3D" + libraryType;
        const sortParam = "%26sort%3Drandom";
        newUrl = url + keyParam + typeParam + sortParam;
    }

    document.getElementById('enhanceotron-shuffle').href = newUrl;

    // default link action
    return true;
}

function createShuffleElem() {
    let a = document.createElement('a');
    let linkText = document.createTextNode(" 🎲 " + chrome.i18n.getMessage("shuffle"));
    a.setAttribute("id", "enhanceotron-shuffle");
    a.appendChild(linkText);
    a.title = "Sort the library randomly";
    a.style.marginLeft = "25px";
    a.onclick=updateUrl;
    return a;
}

document.arrive('[class*="PageHeaderBadge-badge-"]', function() {
    if (!document.getElementById('enhanceotron-shuffle')) {
        let headerBadgeNode = document.querySelector('[class*="PageHeaderBadge-badge-"]');
        if (headerBadgeNode) {
            // only add shuffle button to Movies and TV pages
            const buttons = document.getElementsByTagName("button");
            let type = null;
            for (let button of buttons) {
                if (button.innerText) {
                    let buttonText = button.innerText.toLowerCase();
                    if (buttonText === "movies") {
                        type = 1;
                        break;
                    } else if (buttonText === "tv shows") {
                        type = 2;
                        break;
                    } else if (buttonText === "seasons") {
                        type = 3;
                        break;
                    } else if (buttonText === "episodes") {
                        type = 4;
                        break;
                    }
                }
            }

            if (type) {
                libraryType = type;
                headerBadgeNode.parentNode.insertBefore(createShuffleElem(), headerBadgeNode.nextSibling);
                updateUrl();
            }
        }
    }
});


// plex regenerates the count on changes to sort, causing the shuffle button to be out of order.
// so we remove it along with the counter and recreate when the counter reappears
// v4.x
document.leave('[class*="PageHeaderBadge-badge-"]', function() {
    let shuffleNode = document.getElementById('enhanceotron-shuffle')
    if (shuffleNode) {
        shuffleNode.remove();
    }
});


// ULTRAWIDE ZOOM //

function createZoomElem() {
    let widescreenBtn = document.createElement('button');
    widescreenBtn.setAttribute("id","enhanceotron-widescreen");
    widescreenBtn.setAttribute("title","Zoom for 21:9");

    //widescreenBtn.style.marginLeft = "10px";
    widescreenBtn.style.opacity = "0.5";

    widescreenBtn.style.marginLeft = "5px";
    widescreenBtn.style.fontSize = "18px";
    widescreenBtn.style.height = "30px";
    widescreenBtn.style.width = "30px";

    widescreenBtn.style.background = "none";
    widescreenBtn.style.border = "0";
    widescreenBtn.style.cursor = "pointer";
    widescreenBtn.style.outline = "none";
    widescreenBtn.style.padding = "0";
    widescreenBtn.style.textDecoration = "none";
    widescreenBtn.style.touchAction = "manipulation";
    widescreenBtn.style.transition = "color .2s";
    widescreenBtn.style.userSelect = "none";

    let widescreenIcon = document.createElement("img");
    widescreenIcon.src = chrome.runtime.getURL("img/icon219.svg");

    widescreenIcon.style.height = "1.2em";
    widescreenIcon.style.width = "1.2em";
    widescreenIcon.style.position = "relative";
    widescreenIcon.style.top = "-2px";
    widescreenIcon.style.verticalAlign = "middle";

    widescreenBtn.appendChild(widescreenIcon);
    widescreenBtn.onclick = function () {
        let videoElem = document.querySelector('video[class*="HTMLMedia-mediaElement-"]');
        if (videoElem.style.transform === "scale(1.34)") {
            videoElem.style.transform = "scale(1)";
            widescreenBtn.style.opacity = "0.5";
        } else if (videoElem.parentElement.style.height === "100%") {
            videoElem.style.transform = "scale(1.34)";
            widescreenBtn.style.opacity = "1";
        }
    }

    const rightControls = document.querySelector('[class*="PlayerControls-buttonGroupRight-"]');

    if (rightControls) {
        rightControls.insertBefore(widescreenBtn, rightControls.lastChild);
    }
}

// AUDIO COMPRESSOR //

function createCompressor() {
    let compressorBtn = document.createElement('button');
    compressorBtn.setAttribute("id","enhanceotron-compressor");
    //compressorBtn.setAttribute('data-active', 'false');
    compressorBtn.setAttribute('title', 'Volume Compressor');

    //compressorBtn.style.marginLeft = "10px";
    compressorBtn.style.opacity = compressorActive ? "1" : "0.5";

    compressorBtn.style.marginLeft = "5px";
    compressorBtn.style.fontSize = "18px";
    compressorBtn.style.height = "30px";
    compressorBtn.style.width = "30px";

    compressorBtn.style.background = "none";
    compressorBtn.style.border = "0";
    compressorBtn.style.cursor = "pointer";
    compressorBtn.style.outline = "none";
    compressorBtn.style.padding = "0";
    compressorBtn.style.textDecoration = "none";
    compressorBtn.style.touchAction = "manipulation";
    compressorBtn.style.transition = "color .2s";
    compressorBtn.style.userSelect = "none";

    let compressorIcon = document.createElement("img");
    compressorIcon.src = chrome.runtime.getURL("img/compress.svg");

    compressorIcon.style.height = "1.2em";
    compressorIcon.style.width = "1.2em";
    compressorIcon.style.position = "relative";
    compressorIcon.style.top = "-2px";
    compressorIcon.style.verticalAlign = "middle";

    compressorBtn.appendChild(compressorIcon);

    compressorBtn.onclick = function () {
        //const active = compressorBtn.getAttribute('data-active');
        if (source && !compressorActive) {
            //compressorBtn.setAttribute('data-active', 'true');
            compressorActive = true
            compressorBtn.style.opacity = "1";
            source.disconnect(enhanceotronAudioCtx.destination);
            source.connect(compressor);
            compressor.connect(enhanceotronAudioCtx.destination);
        } else if (source && compressorActive) {
            //compressorBtn.setAttribute('data-active', 'false');
            compressorActive = false
            compressorBtn.style.opacity = "0.5";
            source.disconnect(compressor);
            compressor.disconnect(enhanceotronAudioCtx.destination);
            source.connect(enhanceotronAudioCtx.destination);
        }
    }

    const rightControls = document.querySelector('[class*="PlayerControls-buttonGroupRight-"]');

    if (rightControls) {
        rightControls.insertBefore(compressorBtn, rightControls.lastChild);
    }
}

document.arrive('video[class*="HTMLMedia-mediaElement-"]', function() {
    //const videoElem = document.querySelector('.HTMLMedia-mediaElement-2XwlNN');
    const videoElem = document.querySelector('video[class*="HTMLMedia-mediaElement-"]');

    // ensure audio isnt zeroed out
    videoElem.crossOrigin = "anonymous";

    // audioContext can only be created/resumed after user gesture
    // https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
    videoElem.addEventListener('play', () => {
        if (!enhanceotronAudioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            enhanceotronAudioCtx = new AudioContext();

            if (!source) {
                source = enhanceotronAudioCtx.createMediaElementSource(videoElem);
            }

            compressor = enhanceotronAudioCtx.createDynamicsCompressor();
            // note: dynamicsCompressor's internals are not well documented
            // a make-up gain is applied by browser as the threshold is lowered
            // todo: test ff/safari implementations
            compressor.threshold.value = -50;
            compressor.knee.value = 12;

            source.connect(enhanceotronAudioCtx.destination);
        }
    });
});

// ADD ULTRAWIDE AND COMPRESSOR BOTTOM TOOLBAR BUTTONS

document.arrive("button[data-qa-id='volumeButton']", function() {
    // styles hardcoded above, since class names always change
    // const btnClasses = ["PlayerIconButton-playerButton-RFZk1i", "IconButton-button-30bRLm", "Link-link-3cHWtJ", "Link-default-5Qrl3D"];
    // const iconClass = "PlexIcon-plexIcon-2E9Gg6";

    if (!document.getElementById('enhanceotron-widescreen')) {
        createZoomElem();
    }

    if (!document.getElementById('enhanceotron-compressor')) {
        createCompressor();
    }
});

// Plex v4.64.x
document.arrive("button[data-testid='volumeButton']", function() {
    // styles hardcoded above, since class names always change
    // const btnClasses = ["PlayerIconButton-playerButton-RFZk1i", "IconButton-button-30bRLm", "Link-link-3cHWtJ", "Link-default-5Qrl3D"];
    // const iconClass = "PlexIcon-plexIcon-2E9Gg6";

    if (!document.getElementById('enhanceotron-widescreen')) {
        createZoomElem();
    }

    if (!document.getElementById('enhanceotron-compressor')) {
        createCompressor();
    }
});
