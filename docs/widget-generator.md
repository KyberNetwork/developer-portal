---
id: WidgetGenerator
title: Widget Generator
---

<style>
    .navPusher article {
      padding: 0;
      background: transparent;
      border: none;
    }
    
    .onPageNav {
      display: none;
    }
    
    .postHeader {
      display: none;
    }
    
    .docsNavContainer {
      flex: 0 0 260px;
    }
    
    .docMainContainer {
      flex-grow: 1;
    }
    
    @media only screen and (min-width: 1024px) {
      .docOnPageNav {
        display: initial;
        visibility: hidden
      }
    
      .docMainContainer {
        position: relative
      }
    
      .docMainContainer .wrapper {
        width: 1073px;
      }
    }
</style>

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
    var iframe = document.getElementById("widget-generator-iframe");
    if (domain === "developer.kyber.network") {
      iframe.src = defaultWidgetUrl;
    } else {
      iframe.src = fallbackWidgetUrl;
    }
  });
</script>
