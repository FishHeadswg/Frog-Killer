// ==UserScript==
// @name         Frog_Killer
// @namespace    https://github.com/FishHeadswg
// @version      0.4.7
// @description  Shoots frogs on site. Requires 4chanx and catalog view.
// @author       FishHeadswg
// @updateURL    https://github.com/FishHeadswg/Frog-Killer/raw/master/Frog%20Killer.user.js
// @downloadURL  https://github.com/FishHeadswg/Frog-Killer/raw/master/Frog%20Killer.user.js
// @match *://boards.4channel.org/*
// @match *://boards.4chan.org/*
// @exclude-match *://boards.4channel.org/*/thread/*
// @exclude-match *://boards.4chan.org/*/thread/*
// @grant        none
// @run          document-idle
// ==/UserScript==

(function () {
    'use strict';

    class Frogs {
        constructor() {
            this.addLink();
        }
        init() {
            this.thumbs = [];
            this.canvas = document.createElement("canvas");
            this.context = this.canvas.getContext('2d');
            let imgs = document.getElementsByTagName("img");
            for (let i = 0; i < imgs.length; i++) {
                if (imgs[i].getAttribute('class') === "catalog-thumb")
                    this.thumbs.push(imgs[i]);
            }
            let promises = [];
            for (let k = 0; k < this.thumbs.length; k++) {
                promises.push(this.getDataUri(this.thumbs[k].src));
            }
            Promise.all(promises).then(function (base64) {
                for (let i = 0; i < base64.length; i++) {
                    frogs.createImg(i, base64[i]);
                }
            });
        }
        addLink() {
            if (document.getElementsByClassName("bottomlink").length < 1)
                return setTimeout(() => this.addLink(), 1000);
            const navlinks = document.getElementsByClassName("bottomlink");
            const frogbtn = document.createElement("span");
            frogbtn.className = "brackets-wrap frogs";
            const frogbtnHref = document.createElement("a");
            frogbtnHref.href = "#frogs";
            frogbtnHref.innerText = "Frogs";
            frogbtn.appendChild(frogbtnHref);
            frogbtn.addEventListener("click", () => {
                this.init();
            });
            navlinks[0].parentNode.insertBefore(frogbtn, navlinks[0].nextSibling);
        }
        getDataUri(targetUrl) {
            return new Promise(function (resolve, reject) {
                var xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        resolve(reader.result);
                    };
                    reader.readAsDataURL(xhr.response);
                }
                xhr.onerror = function () {
                    reject({
                        status: this.status,
                        statusText: xhr.statusText
                    });
                };
                var proxyUrl = 'https://cors.gnfos.com/';
                xhr.open('GET', proxyUrl + targetUrl);
                xhr.responseType = 'blob';
                xhr.send();
            });
        }
        shootFrogs(data) {
            let r = 0;
            let g = 0;
            let b = 0;
            for (let j = 0; j < data.length; j += 4) {
                if ((r === 13) && (g === 75) && (b === 5))
                    return true;
                if (b < 5) {
                    if (data[j] <= 16 && data[j + 1] <= 16 && data[j + 2] <= 16) {
                        b++;
                        continue;
                    }
                }
                if (g < 75) {
                    if ((data[j] >= 38 && data[j] <= 94) && (data[j + 1] >= 116 && data[j + 1] <= 148) && (data[j + 2] >= 0 && data[j + 2] <= 60)) {
                        g++;
                        continue;
                    }
                }
                if (r < 13) {
                    if ((data[j] >= 132 && data[j] <= 168) && (data[j + 1] >= 60 && data[j + 1] <= 106) && (data[j + 2] >= 0 && data[j + 2] <= 84)) {
                        r++;
                    }
                }
            }
            return false;
        }
        createImg(i, base64) {
            new Promise(function (resolve, reject) {
                var image = new Image();
                image.onload = () => {
                    frogs.context.drawImage(image, 0, 0);
                    resolve(image);
                }
                image.src = base64;
            }).then(function (img) {
                let imageData = frogs.context.getImageData(0, 0, img.width, img.height);
                if (frogs.shootFrogs(imageData.data))
                    frogs.thumbs[i].parentElement.parentElement.parentElement.children[0].click();
            });
        }
    }
    window.Frogs = Frogs;
    window.frogs = new Frogs();
})();
