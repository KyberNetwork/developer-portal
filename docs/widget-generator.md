---
id: WidgetGenerator
title: Widget Generator
---

<iframe
  id="widget-generator-iframe"
  name="Generator"
  src=""
  width="100%"
  height="1200">
</iframe>

<script>  
  document.addEventListener('DOMContentLoaded', function() {
    var defaultWidgetUrl = "https://widget.kyber.network/widget/config/?widget_url=https://widget.kyber.network";
    var fallbackWidgetUrl = "https://widget.knstats.com/widget/config/?widget_url=https://widget.knstats.com";
    var domain = window.location.hostname;
    var article = document.querySelector("article");
    var iframe = document.getElementById("widget-generator-iframe");
    article.style.padding = 0;
    article.style.background = "transparent";
    article.style.border = "none";
    document.querySelector('.onPageNav').style.display = "none";
    document.querySelector('.postHeader').style.display = "none";
    document.querySelector('.docsNavContainer').style.flex = "0 0 260px";
    document.querySelector('.docMainContainer').style.cssText = "flex-grow:1;padding-top:10px";
    if (domain === "developer.kyber.network") {
      iframe.src = defaultWidgetUrl;
    } else {
      iframe.src = fallbackWidgetUrl;
    }
  });
</script>
