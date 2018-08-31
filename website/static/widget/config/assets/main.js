(function () {
    var excludedInput = ["button_theme"];

    function getWidgetUrl() {
        var url = new URLSearchParams(location.search).get("widget_url");
        return url || "https://widget.kyber.network/v0.1";

    }

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    function debounce(func, wait, immediate) {
        var timeout;
        return function () {
            var context = this, args = arguments;
            var later = function () {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    function grabForm() {
        var form = document.querySelector("form");
        var type = form.type.value || "pay";
        var receiveAddr = form.receiveAddr,
            receiveToken = form.receiveToken,
            receiveAmount = form.receiveAmount
        var data = [], error = [], msg, name, value;
        form.querySelectorAll("input, select").forEach(function (node) {
            name = node.getAttribute("name");

            if ((node.type && node.type === 'radio' && !node.checked) || excludedInput.indexOf(name) > -1) return;

            node.classList.remove("invalid");
            node.removeAttribute("title");

            if (!node.checkValidity()) {
                msg = node.getAttribute("message") || ("Invalid input for: " + name);
                node.setAttribute("title", msg);
                error.push(msg);
                return;
            }

            // set name - value
            if (node.type && node.type === 'checkbox') {
                value = node.checked.toString();
            } else if (node.hasAttribute("data-type-" + type)) {
                value = node.getAttribute("data-type-" + type);
            } else {
                value = node.value;
            }

            if (name && value) {
                if (name != "extraParams") {
                    form.setAttribute("data-widget-" + name, value);
                    data.push(name + "=" + encodeURIComponent(value));
                } else {
                    data.push(value);
                }
            }
        });

        // some integration checks

        if (type === "pay") {
            if (!receiveAddr.value) {
                receiveAddr.classList.add("invalid");
                msg = "Recipient Address is required for widget type of 'Pay'.";
                receiveAddr.setAttribute("title", msg);
                error.push(msg);
            }
            if (!receiveToken.value) {
                receiveToken.classList.add("invalid");
                msg = "Receiving Token Symbol is required for widget type of 'Pay'.";
                receiveToken.setAttribute("title", msg);
                error.push(msg);
            }
        }

        if (type === "buy") {
            if (!receiveToken.value) {
                receiveToken.classList.add("invalid");
                msg = "Receiving Token Symbol is required for widget type of 'Buy'.";
                receiveToken.setAttribute("title", msg);
                error.push(msg);
            }
        }

        return {
            error: error,
            data: data.join("&")
        }
    }

    function copyClipboard(selector) {
        var input = document.querySelector(selector).textContent;
        var aux = document.createElement("input");
        aux.setAttribute("value", input);
        document.body.appendChild(aux);
        aux.select();
        var result=document.execCommand("copy");
        document.body.removeChild(aux);
        return result;
    }

    function wireEvents() {
        var form = document.querySelector("form");
        form.querySelectorAll("input, select").forEach(function (node) {
            node.addEventListener('change', generateTag);
            node.addEventListener('keyup', generateTag);
            node.addEventListener('paste', function () {
                setTimeout(generateTag, 0);
            });
        });

      document.querySelector(".btn-copy").addEventListener('click', function(){
        var selector = document.querySelector(".tablink.active").getAttribute("data-tab") + " code";
        if (!copyClipboard(selector)) {
          alert("Copy failed. Please use browser's copy feature instead.");
          return;
        }

        var sourceContent = document.getElementById("sourceContent");

        sourceContent.classList.add("active");

        setTimeout(function() {
          sourceContent.classList.remove("active");
        }, 3000);
      });
    }

    var generateTag = debounce(function () {
        var formData = grabForm();
        if (formData.error && formData.error.length) {
            document.getElementById("widget").innerHTML = "<p class='error'>" +
                formData.error.join("<br>") + "</p>";
            document.getElementById("sourceHtml").textContent = "";
            return;
        }

        var mode = document.querySelector("form").mode.value || "tab";
        var buttonTheme = document.querySelector('input[name=button_theme]:checked').value;

        var widgetBaseUrl = getWidgetUrl();
        var url = widgetBaseUrl + "/?" + formData.data;
        var cssUrl = widgetBaseUrl + '/widget.css';
        var jsUrl = widgetBaseUrl + '/widget.js';
        var tagHtml = "<a href='" + url + "'\nclass='kyber-widget-button kyber-widget-button--" + buttonTheme + "' ";
        tagHtml += "name='KyberWidget - Powered by KyberNetwork' title='Pay with tokens'\n";
        tagHtml += "target='_blank'>Pay with tokens</a>";

        var fullHtml = "<!-- Add this to the <head> tag -->\n<link rel='stylesheet' href='" + cssUrl + "'> \n\n";
        fullHtml += tagHtml;
        if (mode !== "tab") {
            fullHtml += "\n\n<!-- Add this to the end of <body> tag -->\n<script async src='" + jsUrl + "'></script>"
        }

        document.getElementById("widget").innerHTML = tagHtml;
        document.getElementById("sourceHtml").textContent = fullHtml;
        Prism.highlightElement(document.getElementById("sourceHtml"));

        if (window.kyberWidgetOptions && window.kyberWidgetOptions.register) {
            window.kyberWidgetOptions.register();
        }

    }, 50, false);


    generateTag();
    wireEvents();

})();
