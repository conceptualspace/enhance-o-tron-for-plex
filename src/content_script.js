// copyright 2020 conceptualspace

"use strict";

/*
// link to movie trailer
// todo: embed trailer?
$.get( "https://www.youtube.com/results?search_query=movie+trailer", function( data ) {
    $( ".result" ).html( data );
});
*/

function createTrailer(title, year, margin) {
    let trailer = document.createElement('a');
    trailer.setAttribute("id", "trailer");
    trailer.setAttribute('href',"https://www.youtube.com/results?search_query="+title+"+"+year+"+trailer");
    trailer.setAttribute('target',"_blank");
    if (margin) {
        trailer.style.marginLeft = '20px';
    }
    trailer.innerText = "Play Trailer";
    return trailer;
}

// selectors for v3.x
$(document).arrive("div[data-qa-id='preplaySecondTitle']", function() {
    let title = $("div[data-qa-id='preplayMainTitle']")[0].textContent;
    let year = $("div[data-qa-id='preplaySecondTitle'] .PrePlayLeftTitle-leftTitle-Ev1KGW")[0].textContent;
    if (! $('#trailer')[0]) {
        $('.PrePlayMetadataInnerContent-innerContent-1BPzwp')[0].appendChild(createTrailer(title, year, false));
    }
});

// selectors for v4.x
$(document).arrive("div[data-qa-id='preplay-secondTitle']", function() {
    let title = $("div[data-qa-id='preplay-mainTitle']")[0].textContent;
    let year = $("div[data-qa-id='preplay-secondTitle']")[0].textContent;
    if (! $('#trailer')[0]) {
        $('.PrePlayTertiaryTitle-tertiaryTitle-1LwUaC')[0].appendChild(createTrailer(title, year, true));
    }
});


// shuffle library titles
$(document).arrive(".PageHeaderBadge-badge-2oDBgn", function() {
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
    let linkText = document.createTextNode(" 🎲 Shuffle");
    a.appendChild(linkText);
    a.title = "Sort the library randomly";
    a.href = newUrl;
    a.style.marginLeft = "25px";

    let headerBadgeNode = $(".PageHeaderBadge-badge-2oDBgn");
    headerBadgeNode[0].parentNode.insertBefore(a, headerBadgeNode.nextSibling);
});


// 2.35:1 aka 21:9 widescreen zoom
$(document).arrive(".PlayerIconButton-playerButton-1DmNp4", function() {
    if (! $('#widescreen')[0]) {
        let widescreenBtn = document.createElement('button');
        const classes = ["PlayerIconButton-playerButton-1DmNp4", "IconButton-button-9An-7I", "Link-link-2n0yJn", "Link-default-2XA2bN"];
        widescreenBtn.setAttribute("id","widescreen");
        widescreenBtn.classList.add(...classes);
        widescreenBtn.style.marginLeft = "10px";
        widescreenBtn.style.opacity = "0.5";

        let widescreenIcon = document.createElement("img");
        widescreenIcon.src = chrome.runtime.getURL("img/icon219.svg");
        widescreenIcon.classList.add("PlexIcon-plexIcon-8Tamaj");
        widescreenIcon.style.width = "1.3em";
        widescreenIcon.style.height = "1.3em";

        widescreenBtn.appendChild(widescreenIcon);

        widescreenBtn.onclick = function () {
            let video = $("video.HTMLMedia-mediaElement-35x77U")[0];
            if (video.style.transform === "scale(1.34)") {
                video.style.transform = "scale(1)";
                widescreenBtn.style.opacity = "0.5";
            } else if (video.parentElement.style.height === "100%") {
                video.style.transform = "scale(1.34)";
                widescreenBtn.style.opacity = "1";
            }
        }

        // insert button into bottom toolbar
        let closeBtn = document.querySelectorAll("button[data-qa-id='closeButton']")[0];
        closeBtn.parentNode.insertBefore(widescreenBtn, closeBtn.nextSibling);
    }
});
