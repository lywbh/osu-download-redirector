// ==UserScript==
// @name         osu! download redirector
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  redirect download request to bloodcat
// @author       kamimi
// @match        https://osu.ppy.sh/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    window.onload = function() {
        const bloodUrl = "https://bloodcat.com/osu/s/";
        if (window.location.pathname === "/beatmapsets") {
			let beatmapList = document.getElementsByClassName("beatmapsets__items")[0];
			let iconBoxs = beatmapList.getElementsByClassName("beatmapset-panel__icons-box");
			addIconList(iconBoxs);
            beatmapList.addEventListener("DOMNodeInserted", function (e) {
				let iconBoxs = e.srcElement.getElementsByClassName("beatmapset-panel__icons-box");
				addIconList(iconBoxs);
            });
        } else if (/^\/beatmapsets\/[0-9]*.*$/.test(window.location.pathname)) {
			let iconBoxs = document.getElementsByClassName("beatmapset-header__buttons");
			addIconDetail(iconBoxs);
		} else if (/^\/(s)|(b)\/[0-9]*.*$/.test(window.location.pathname)) {
            let iconBoxs = document.getElementsByClassName("paddingboth");
			addIconDetailOld(iconBoxs);
        }
		
		function addIconList(iconBoxs) {
			for (let i = 0; i < iconBoxs.length; i++) {
				let downloadLink = iconBoxs[i].getElementsByClassName("js-beatmapset-download-link")[0];
				if (downloadLink) {
					let newLinkNode = replaceUrl(downloadLink, -2);
					newLinkNode.style.color = "#4ad";
					iconBoxs[i].appendChild(newLinkNode);
				}
			}
		}
		
		function addIconDetail(iconBoxs) {
			for (let i = 0; i < iconBoxs.length; i++) {
				let downloadLink = iconBoxs[i].getElementsByClassName("js-beatmapset-download-link")[0];
				if (downloadLink) {
					let newLinkNode = replaceUrl(downloadLink, -2);
					newLinkNode.style.backgroundColor = "#4ad";
					iconBoxs[i].appendChild(newLinkNode);
				}
			}
		}
		
		function addIconDetailOld(iconBoxs) {
			for (let i = 0; i < iconBoxs.length; i++) {
				let downloadButtons = iconBoxs[i].getElementsByClassName("beatmapDownloadButton");
				let downloadButton = downloadButtons[downloadButtons.length - 1];
				if (downloadButton) {
					let downloadLink = downloadButton.getElementsByClassName("beatmap_download_link")[0];
					if (downloadLink) {
						let newButton = downloadButton.cloneNode();
						let newLinkNode = replaceUrl(downloadLink, -1);
						newButton.appendChild(newLinkNode);
						iconBoxs[i].insertBefore(newButton, downloadButton);
					}
				}
			}
		}

        function replaceUrl(linkNode, pathIndex) {
			let newNode = copyElement(linkNode);
            if (newNode.href && newNode.href.indexOf(bloodUrl) === -1) {
				let splitUrl = newNode.href.split("/");
				let index;
				if (pathIndex >= 0) {
					index = pathIndex;
				} else {
					index = splitUrl.length + pathIndex;
				}
				let setId = splitUrl[index];
				newNode.href = bloodUrl + setId;
			}
			return newNode;
        }
		
		function copyElement(linkNode) {
			let objE = document.createElement("div");
　　 		objE.innerHTML = linkNode.outerHTML;
			return objE.childNodes[0];
		}
    }
})();
