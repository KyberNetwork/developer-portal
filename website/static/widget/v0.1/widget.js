(function (global, editionTag) {

  function getCurrentScriptDir(defDir) {
    defDir = defDir || "https://widget.kyber.network/v0.1";
    if (!document.currentScript || !document.currentScript.src) return defDir;

    var path = document.currentScript.src;
    return path.substring(0, path.lastIndexOf("/"));
  }

  global.kyberWidgetOptions = (function(editionTag) {
    var editions = {
      standard: getCurrentScriptDir(),
      etheremon: "https://widget-etheremon.knstats.com"
    }
 
    var params = new URLSearchParams(location.search);
    var path = params.get("widget_url");
    var current = params.get("widget_edition") || 
      editionTag.getAttribute("data-kyber-widget-edition") ||
      editionTag.getAttribute("data-edition");
    var currentValid = !!current && !!editions[current];

    if (!path && !currentValid) {
      var button = document.querySelector(".kyber-widget-button");
      if (button && button.href) {
        path = button.href.split("?")[0];
      }
    }

    if (path) {
      path = path.toLowerCase();
      if (path.substr(-1) === "/") {
        path = path.substr(0, path.length - 1);
      }
      for (var prop in editions) {
        if (path === editions[prop]) {
          current = prop;
          currentValid = true;
          break;
        }
      }
    }

    if (!currentValid) current = "standard";

    document.documentElement.setAttribute("data-kyber-widget-edition", current);
    path = path || editions[current];

    return {
      edition: current,
      path: path
    }

  })(editionTag);

  var closeWidget = global.kyberWidgetOptions.onClose = function() {
    var overlay = document.getElementById("kyber-widget-overlay");
    if (overlay) {
      var body = document.body,
        oldValue = body.getAttribute("data-overflow") || null;
      body.style.overflow = oldValue;
      body.removeAttribute("data-overflow");
      overlay.remove();
    }
  }

  function insertTags(baseUrl) {
    if (!document.getElementById("kyber-widget-script")) {
      var script = document.createElement("script");
      script.id = "kyber-widget-script";
      script.async = true;
      script.onerror = function () {
        global.kyberWidgetOptions.jsLoadError = true;
        console.log("Error loading KyberWidget.");
        closeWidget();
      };
      script.onload = function () {
        document.getElementById("kyber-widget") && global.kyberWidgetInstance.render();
      };
      script.src = baseUrl + "/app.min.js?t=" + Date.now();
      document.body.appendChild(script);
    }
    // add CSS tag
    if (!document.getElementById("kyber-widget-css")) {
      var css = document.createElement("link");
      css.id = "kyber-widget-css";
      css.setAttribute("rel", "stylesheet")
      css.setAttribute("href", baseUrl + "/app.bundle.css?t=" + Date.now());
      document.head.appendChild(css);
    }
  }

  (global.kyberWidgetOptions.register = function(selector) {
    selector = selector || ".kyber-widget-button";
    var hasDomMode = false;
    var isStandardEdition = (global.kyberWidgetOptions.edition === "standard");
    var extensionInstalled = !!global.kyberwidget && !!global.kyberwidget.performPay;
    var shouldDelegate = false && extensionInstalled && isStandardEdition;

    document.querySelectorAll(selector).forEach(function (tag) {

      var params = tag.searchParams || (new URLSearchParams(new URL(tag.href).search));
      var mode = params.get("mode") || "tab";
      if (mode === "popup") hasDomMode = true;
      
      if (mode !== "popup" && mode !== "iframe") return;

      tag.addEventListener("click", function (e) {

        if (mode === 'popup' && global.kyberWidgetOptions.jsLoadError) {
          // error loadding js, just fallback to new tab mode
          return;
        }

        // js loading ok, disable new tab mode
        e.preventDefault();
        
        // remove old overlay, just to ensure
        closeWidget();

        // Delegate to KyberWidget extension if installed
        var paramObj = {};
        if (shouldDelegate) {
          for (var pair of params) {
            paramObj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
          }
          global.kyberwidget.performPay(paramObj);
          return;
        }

        // create a new overlay
        var overlay = document.createElement("DIV");
        overlay.id = "kyber-widget-overlay";
        overlay.addEventListener("click", function (e) {
          if (e.target === this) {
            closeWidget();
          }
        });

        var element = '';
        if (mode === 'popup') {
          // create the widget container
          element = document.createElement("DIV");
          element.id = "kyber-widget";
          element.classList.add("kyber-widget");
          // set widget attributes
          element.setAttribute("data-widget-attribute", "true");
          for (var pair of params) {
            element.setAttribute("data-widget-" +
              decodeURIComponent(pair[0]).replace(/([a-z])([A-Z])/g,
              '$1-$2'), decodeURIComponent(pair[1]));
          }
        } else {
          element = document.createElement("IFRAME");
          element.id = "kyber-widget-iframe";
          element.onload = function () {
            global.addEventListener("message", function(e){
              if (e.data === "CloseWidget") {
                closeWidget();
              }
            });
          };
          element.src = tag.href;
        }

        // add the tags to body
        overlay.appendChild(element);
        document.body.appendChild(overlay);
        if (document.body.style.overflow) {
          document.body.setAttribute("data-overflow", document.body.style.overflow);
        }
        document.body.style.overflow = "hidden";

        // render the widget
        global.kyberWidgetInstance && global.kyberWidgetInstance.render();
      })
    });

    if (hasDomMode & !shouldDelegate) insertTags(global.kyberWidgetOptions.path);

  })();

})(this, document.getElementById("kyber-widget-edition") || document.currentScript || document.documentElement);
