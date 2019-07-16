// ==UserScript==
// @name         osu! download redirector
// @namespace    https://github.com/lywbh/osu-download-redirector
// @version      0.1.5
// @description  redirect download request from ppy.sh to bloodcat.com
// @author       kamimi
// @match        https://osu.ppy.sh/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /**
     * when page loaded/refreshed.
     */
    window.onload = () => {
        handleNewSite();
        handleOldSite();
    };

    /**
     * The new osu site is a single page app, modify the xhr here for listening page redirect.
     */
    (function () {
        function ajaxEventTrigger(event) {
            let ajaxEvent = new CustomEvent(event, {detail: this});
            window.dispatchEvent(ajaxEvent);
        }

        let oldXHR = window.XMLHttpRequest;

        function newXHR() {
            let realXHR = new oldXHR();
            realXHR.addEventListener('readystatechange', function () {
                ajaxEventTrigger.call(this, 'ajaxReadyStateChange');
            }, false);
            return realXHR;
        }

        window.XMLHttpRequest = newXHR;
    })();

    /**
     * listen page redirect.
     */
    window.addEventListener('ajaxReadyStateChange', function (e) {
        if (e.detail.readyState === 4) {
            if (/^https:\/\/osu.ppy.sh\/beatmapsets(\/)?[0-9]*$/.test(e.detail.responseURL)) {
                // wait a while for dom rendering
                setTimeout(handleNewSite, 500);
            }
        }
    });

    /**
     * add icons for new site.
     */
    function handleNewSite() {
        if (window.location.pathname === "/beatmapsets") {
            // beatmap list
            let beatmapList = document.getElementsByClassName("beatmapsets__items")[0];
            if (beatmapList) {
                let iconBoxes = beatmapList.getElementsByClassName("beatmapset-panel__icons-box");
                addIconList(iconBoxes);
                beatmapList.addEventListener("DOMNodeInserted", e => {
                    let iconBoxes = e.target.getElementsByClassName("beatmapset-panel__icons-box");
                    addIconList(iconBoxes);
                });
            }
        } else if (/^\/beatmapsets\/[0-9]*.*$/.test(window.location.pathname)) {
            // beatmap details
            let iconBoxes = document.getElementsByClassName("beatmapset-header__buttons");
            addIconDetail(iconBoxes);
        }
    }

    /**
     * add icons for old site.
     */
    function handleOldSite() {
        if (/^\/(s)|(b)\/[0-9]*.*$/.test(window.location.pathname)) {
            // beatmap details only at old site
            let iconBoxes = document.getElementsByClassName("paddingboth");
            addIconDetailOld(iconBoxes);
        }
    }

    function addIconList(iconBoxes) {
        for (let i = 0; i < iconBoxes.length; i++) {
            let downloadLink = iconBoxes[i].getElementsByClassName("js-beatmapset-download-link")[0];
            if (downloadLink) {
                let newNode = deepCloneNode(downloadLink);
                replaceUrl(newNode, -2);
                newNode.style.color = "#4ad";
                iconBoxes[i].appendChild(newNode);
            }
        }
    }

    function addIconDetail(iconBoxes) {
        for (let i = 0; i < iconBoxes.length; i++) {
            let downloadLink = iconBoxes[i].getElementsByClassName("js-beatmapset-download-link")[0];
            if (downloadLink) {
                let newNode = deepCloneNode(downloadLink);
                replaceUrl(newNode, -2);
                newNode.style.backgroundColor = "#4ad";
                iconBoxes[i].appendChild(newNode);
            }
        }
    }

    function addIconDetailOld(iconBoxes) {
        for (let i = 0; i < iconBoxes.length; i++) {
            let downloadButtons = iconBoxes[i].getElementsByClassName("beatmapDownloadButton");
            let downloadButton = downloadButtons[downloadButtons.length - 1];
            if (downloadButton) {
                let downloadLink = downloadButton.getElementsByClassName("beatmap_download_link")[0];
                if (downloadLink) {
                    let newButton = downloadButton.cloneNode();
                    let newNode = downloadLink.cloneNode();
                    let img = document.createElement("img");
                    img.src = "data:image/png;base64,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";
                    newNode.appendChild(img);
                    replaceUrl(newNode, -1);
                    newButton.appendChild(newNode);
                    iconBoxes[i].insertBefore(newButton, downloadButton);
                }
            }
        }
    }

    /**
     * replace the origin url with bloodcat.com in download button element
     */
    function replaceUrl(linkNode, pathIndex) {
        const bloodUrl = "https://bloodcat.com/osu/s/";
        if (linkNode.href && linkNode.href.indexOf(bloodUrl) === -1) {
            let splitUrl = linkNode.href.split("/");
            let index;
            if (pathIndex >= 0) {
                index = pathIndex;
            } else {
                index = splitUrl.length + pathIndex;
            }
            let setId = splitUrl[index];
            linkNode.href = bloodUrl + setId;
        }
    }

    function deepCloneNode(linkNode) {
        let objE = document.createElement("div");
        objE.innerHTML = linkNode.outerHTML;
        return objE.childNodes[0];
    }
})();
