/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');

const { Container } = CompLibrary;

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

class Widget extends React.Component {
  componentDidMount() {
    const widgetScript = document.createElement("script");
    const prismScript = document.createElement("script");

    widgetScript.src = "/widget/config/assets/main.js";
    prismScript.src = "https://cdn.jsdelivr.net/npm/prismjs@1.15.0/prism.min.js";
    prismScript.setAttribute("data-manual", "");
    widgetScript.async = true;
    prismScript.async = true;

    document.body.appendChild(widgetScript);
    document.body.appendChild(prismScript);
  }

  render() {
    return (
      <div className="mainContainer">
        <Container>
          <iframe name="Generator" src="/widget/config/index.html" width="100%" height="1350" />
          {/* <h1 className="center">Kyber Payment Widget Configuration</h1>
          <form>
              <section className="section appearance">
                  <h3 className="section-title">Appearance</h3>
                  <div className="item">
                      <label className="item-name">Widget Type:</label>
                      <div className="item-value w30">
                          <label className="pointer">
                              <input type="radio" name="type" value="payment" checked /> Payment
                          </label>
                          <label className="pointer">
                              <input type="radio" name="type" value="swap" /> Swap
                          </label>
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Mode:</label>
                      <div className="item-value w30">
                          <label className="pointer">
                              <input type="radio" name="mode" value="popup" checked /> Popup
                          </label>
                          <label className="pointer">
                              <input type="radio" name="mode" value="tab" /> New Tab
                          </label>
                          <label className="pointer">
                              <input type="radio" name="mode" value="iframe" /> iFrame
                          </label>
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Theme:</label>
                      <div className="item-value w30">
                          <label className="pointer">
                              <input type="radio" name="theme" value="light" checked /> Light
                          </label>
                          <label className="disabled">
                              <input type="radio" name="theme" value="dark" disabled /> Dark
                          </label>
                      </div>
                  </div>
              </section>

              <section className="section">
                  <h3 className="section-title">Parameters</h3>
                  <div className="item" data-hidden-type="swap">
                      <label className="item-name required-type-payment">Recipient Address:</label>
                      <div className="item-value">
                          <input name="receiveAddr" className="full-length" type="text" data-type-swap="self" spellcheck="false" value="0x63B42a7662538A1dA732488c252433313396eade"
                              placeholder="blank, self or 0x..." pattern="^(self)|(0x[a-fA-F0-9]{40})$" message="Recipient Address must be blank, 'self', or a valid Ethereum address." />
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name required-type-payment">Receiving Token Symbol:</label>
                      <div className="item-value">
                          <input name="receiveToken" className="uppercase" type="text" spellcheck="false" maxlength="6" value="ETH" />
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Receiving Amount:</label>
                      <div className="item-value">
                          <input name="receiveAmount" type="number" min="0.001" step="0.000000000000000001" message="Receiving Amount must be at least 0.001." />
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Callback URL:</label>
                      <div className="item-value">
                          <input name="callback" className="full-length" type="url" pattern="https://.+" placeholder="https://..." value="https://kyberpay-sample.knstats.com/callback" message="Callback URL must be a valid HTTPS URL." />
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Param Forwarding:</label>
                      <div className="item-value">
                          <label className="pointer">
                              <input name="paramForwarding" type="checkbox" checked /> Forward params to callback URL
                          </label>
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Network:</label>
                      <div className="item-value">
                          <select name="network">
                              <option value="">default</option>
                              <option value="test">test</option>
                              <option value="ropsten" selected>ropsten</option>
                              <option value="production">production</option>
                              <option value="mainnet">mainnet</option>
                          </select>
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Commision-receiving Address:</label>
                      <div className="item-value">
                          <input name="commissionId" className="full-length" spellcheck="false" type="text" pattern="^0x[a-fA-F0-9]{40}$" placeholder="0x..." message="Commision-receiving Address must be a valid Ethereum address." />
                      </div>
                  </div>
                  <div className="item">
                      <label className="item-name">Extra Params:</label>
                      <div className="item-value">
                          <input name="extraParams" className="full-length" spellcheck="false" type="text" placeholder="name1=value1&name2=value2" />
                      </div>
                  </div>
              </section>
          </form>
          <section className="section results">
              <h3 className="section-title">Widget</h3>
              <div className="item">
                  <label className="item-name align-top"></label>
                  <div id="widget" className="item-value"></div>
              </div>
              <div className="source-tabs">
                  <div className="tabrow">
                      <button className="tablink active" data-tab="#sourceHtmlItem" id="defaultOpen">HTML Source</button>
                      <button className="btn-copy">Copy</button>
                  </div>
                  <div id="sourceHtmlItem" className="tabcontent">
                      <pre><code id="sourceHtml" className="language-markup"></code></pre>
                  </div>
              </div>
          </section> */}
        </Container>
      </div>
    );
  }
}

Widget.title = 'KyberWidget Configuration';

module.exports = Widget;
