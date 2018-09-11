---
id: WidgetGenerator
title: Widget Generator
---

<iframe
  id="widget-generator-iframe"
  name="Generator"
  src="https://widget.kyber.network/widget/config/?widget_url=https://widget.knstats.com/v0.1"
  width="100%"
  height="1100">
</iframe>

<script>  
  document.addEventListener('DOMContentLoaded', function() {
    var fallbackWidgetUrl = "https://widget.knstats.com/widget/config/?widget_url=https://widget.knstats.com/v0.1";
    var domain = window.location.hostname;
    var article = document.querySelector("article");
    article.style.padding = 0;
    article.style.background = "transparent";
    document.querySelector('.onPageNav').style.display = "none";
    if (domain !== "developer.kyber.network") {
      document.getElementById("widget-generator-iframe").src = fallbackWidgetUrl;
    }
  });
</script>
