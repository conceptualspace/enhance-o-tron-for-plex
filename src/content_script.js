// copyright 2020 conceptualspace

"use strict";

let enhanceotronAudioCtx, compressor, source;

// TRAILERS //

function createTrailerElem(title, year, margin) {
    let trailer = document.createElement('a');
    trailer.setAttribute("id", "enhanceotron-trailer");
    trailer.setAttribute('href',"https://www.youtube.com/results?search_query="+title+"+"+year+"+trailer");
    trailer.setAttribute('target',"_blank");
    if (margin) {
        trailer.style.marginLeft = '20px';
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
        // Plex v4.54.x
        let titleNode = document.querySelector('.PrePlayTertiaryTitle-tertiaryTitle-2RGElY');
        if (titleNode) {
            titleNode.appendChild(createTrailerElem(title, year, true));
        } else {
            // Plex < v4.54
            let titleNode = document.querySelector('.PrePlayTertiaryTitle-tertiaryTitle-1LwUaC');
            if (titleNode) {
                titleNode.appendChild(createTrailerElem(title, year, true));
            }
        }
    }
});


// LIBRARY SHUFFLE //

function createShuffleElem() {
    const url = window.location.href;
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
    let newUrl = nonParams + newParams;

    let a = document.createElement('a');
    let linkText = document.createTextNode(" 🎲 " + chrome.i18n.getMessage("shuffle"));
    a.setAttribute("id", "enhanceotron-shuffle");
    a.appendChild(linkText);
    a.title = "Sort the library randomly";
    a.href = newUrl;
    a.style.marginLeft = "25px";

    return a;
}

// Plex v4.x
document.arrive(".PageHeaderBadge-badge-2oDBgn", function() {
    if (!document.getElementById('enhanceotron-shuffle')) {
        let headerBadgeNode = document.querySelector('.PageHeaderBadge-badge-2oDBgn');
        if (headerBadgeNode) {
            headerBadgeNode.parentNode.insertBefore(createShuffleElem(), headerBadgeNode.nextSibling);
        }
    }
});

// Plex v4.54.x
document.arrive(".PageHeaderBadge-badge-1Jxlh2", function() {
    if (!document.getElementById('enhanceotron-shuffle')) {
        let headerBadgeNode = document.querySelector('.PageHeaderBadge-badge-1Jxlh2');
        if (headerBadgeNode) {
            headerBadgeNode.parentNode.insertBefore(createShuffleElem(), headerBadgeNode.nextSibling);
        }
    }
});


// ULTRAWIDE ZOOM //

function createZoomElem(btnClasses, iconClass, videoClass) {
    let widescreenBtn = document.createElement('button');
    widescreenBtn.setAttribute("id","enhanceotron-widescreen");
    widescreenBtn.setAttribute("title","Zoom for 21:9");
    widescreenBtn.classList.add(...btnClasses);
    widescreenBtn.style.marginLeft = "10px";
    widescreenBtn.style.opacity = "0.5";

    let widescreenIcon = document.createElement("img");
    widescreenIcon.src = chrome.runtime.getURL("img/icon219.svg");
    widescreenIcon.classList.add(iconClass);
    widescreenIcon.style.width = "1.3em";
    widescreenIcon.style.height = "1.3em";

    widescreenBtn.appendChild(widescreenIcon);
    widescreenBtn.onclick = function () {
        let videoElem = document.querySelector(`video.${videoClass}`);
        if (videoElem.style.transform === "scale(1.34)") {
            videoElem.style.transform = "scale(1)";
            widescreenBtn.style.opacity = "0.5";
        } else if (videoElem.parentElement.style.height === "100%") {
            videoElem.style.transform = "scale(1.34)";
            widescreenBtn.style.opacity = "1";
        }
    }

    const rightControls = document.querySelector('.PlayerControls-buttonGroupRight-3tN_y5');

    if (rightControls) {
        rightControls.insertBefore(widescreenBtn, rightControls.lastChild);
    }
}

// Plex v4.x
document.arrive(".PlayerIconButton-playerButton-1DmNp4", function() {
    if (!document.getElementById('enhanceotron-widescreen')) {
        const btnClasses = ["PlayerIconButton-playerButton-1DmNp4", "IconButton-button-9An-7I", "Link-link-2n0yJn", "Link-default-2XA2bN"];
        const iconClass = "PlexIcon-plexIcon-8Tamaj";
        const videoClass = "HTMLMedia-mediaElement-35x77U";
        // insert button into bottom toolbar
        createZoomElem(btnClasses, iconClass, videoClass);
    }
});

// Plex v4.54.x
document.arrive(".PlayerIconButton-playerButton-aW9TNw", function() {
    if (!document.getElementById('enhanceotron-widescreen')) {
        const btnClasses = ["PlayerIconButton-playerButton-aW9TNw", "IconButton-button-2smHOM", "Link-link-3v-v0b", "Link-default-1dmcVx"];
        const iconClass = "PlexIcon-plexIcon-1hNiE2";
        const videoClass = "HTMLMedia-mediaElement-2XwlNN";
        // insert button into bottom toolbar
        createZoomElem(btnClasses, iconClass, videoClass);
    }
});

// AUDIO COMPRESSOR //

function createCompressor(btnClasses, iconClass) {
    let compressorBtn = document.createElement('button');
    compressorBtn.setAttribute("id","enhanceotron-compressor");
    compressorBtn.setAttribute('data-active', 'false');
    compressorBtn.setAttribute('title', 'Volume Compressor');
    compressorBtn.classList.add(...btnClasses);
    compressorBtn.style.marginLeft = "10px";
    compressorBtn.style.opacity = "0.5";

    let compressorIcon = document.createElement("img");
    compressorIcon.src = chrome.runtime.getURL("img/compress.svg");
    compressorIcon.classList.add(iconClass);
    compressorIcon.style.width = "1.3em";
    compressorIcon.style.height = "1.3em";

    compressorBtn.appendChild(compressorIcon);

    compressorBtn.onclick = function () {
        const active = compressorBtn.getAttribute('data-active');
        if (source && active === 'false') {
            console.log(source);
            compressorBtn.setAttribute('data-active', 'true');
            compressorBtn.style.opacity = "1";
            source.disconnect(enhanceotronAudioCtx.destination);
            source.connect(compressor);
            compressor.connect(enhanceotronAudioCtx.destination);
        } else if (source && active === 'true') {
            console.log(source);
            compressorBtn.setAttribute('data-active', 'false');
            compressorBtn.style.opacity = "0.5";
            source.disconnect(compressor);
            compressor.disconnect(enhanceotronAudioCtx.destination);
            source.connect(enhanceotronAudioCtx.destination);
        }
    }

    const rightControls = document.querySelector('.PlayerControls-buttonGroupRight-3tN_y5');

    if (rightControls) {
        rightControls.insertBefore(compressorBtn, rightControls.lastChild);
    }
}

// Plex v4.54.x
// we need to listen for the toolbar instead of the video because plex might nuke it duruing loading
document.arrive(".PlayerIconButton-playerButton-aW9TNw", function() {
    if (!document.getElementById('enhanceotron-compressor')) {
        const btnClasses = ["PlayerIconButton-playerButton-aW9TNw", "IconButton-button-2smHOM", "Link-link-3v-v0b", "Link-default-1dmcVx"];
        const iconClass = "PlexIcon-plexIcon-1hNiE2";
        // insert button into bottom toolbar
        createCompressor(btnClasses, iconClass);
    }
});

document.arrive(".HTMLMedia-mediaElement-2XwlNN", function() {
    const videoElem = document.querySelector('.HTMLMedia-mediaElement-2XwlNN');
    if (enhanceotronAudioCtx) {
        source.disconnect();
        enhanceotronAudioCtx.close();
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    enhanceotronAudioCtx = new AudioContext();
    source = enhanceotronAudioCtx.createMediaElementSource(videoElem);
    compressor = enhanceotronAudioCtx.createDynamicsCompressor();

    compressor.threshold.value = -50;
    compressor.knee.value = 40;
    compressor.ratio.value = 12;
    compressor.attack.value = 0;
    compressor.release.value = 0.25;

    source.connect(enhanceotronAudioCtx.destination);
});

