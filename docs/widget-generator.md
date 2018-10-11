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
    
    .docMainContainer {
      flex-grow: 1;
    }
    
    @media only screen and (min-width: 1200px) {
      .docOnPageNav {
        display: initial;
        visibility: hidden
      }
    
      .docMainContainer {
        position: relative
      }
    
      .docMainContainer .wrapper {
        width: 910px;
      }
    }
    
    @media only screen and (max-width: 1200px) {
      .separateOnPageNav .docsNavContainer {
        flex: 0 0 240px;
      }
        
      .docOnPageNav {
        display: none;
      }
    }
</style>

<iframe
  id="widget-generator-iframe"
  name="Generator"
  src=""
  width="100%"
  height="1250">
</iframe>

<script>  
  document.addEventListener('DOMContentLoaded', function() {
    var defaultWidgetUrl = "https://widget.kyber.network/widget/config/?widget_url=https://widget.kyber.network";
    var fallbackWidgetUrl = "https://dev-widget.knstats.com/widget/config/?widget_url=https://dev-widget.knstats.com&version=no";
    var domain = window.location.hostname;
    var iframe = document.getElementById("widget-generator-iframe");
    if (domain === "developer.kyber.network") {
      iframe.src = defaultWidgetUrl;
    } else {
      iframe.src = fallbackWidgetUrl;
    }
  });
</script>
