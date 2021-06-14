/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

class Footer extends React.Component {
  docUrl(doc, language) {
    const { baseUrl } = this.props.config;
    return `${baseUrl}docs/${language ? language + '/' : ''}${doc}`;
  }

  render() {
    return (
      <div id="footer">
        <div className="wrapper">
          <div className="footer-middle">
            <div className="kyber-icon">
              <a href="/">
                {this.props.config.footerIcon && (
                  <img
                    src={this.props.config.baseUrl + this.props.config.footerIcon}
                    alt={this.props.config.title}
                    width="100x"
                  />
                )}
              </a>
            </div>
            <div className="kyber-link-container">
              <div className="kyber-link">
                <span className="kyber-link__text semi-b">Essentials</span>
                {/* Append this.props.language when translations are already available */}
                <a className="kyber-link__text" href={this.docUrl('Start', '')}>Getting Started</a>
                <a className="kyber-link__text" href={this.docUrl('Home-DesignPrinciples', '')}>Design Principles</a>
                <a className="kyber-link__text" href={this.docUrl('Home-ProtocolOverview', '')}>Protocol Overview</a>
                <a className="kyber-link__text" href={this.docUrl('Home-Architecture', '')}>Smart Contract Architecture</a>
              </div>
              <div className="kyber-link">
                <span className="kyber-link__text semi-b">Integrations</span>
                <a className="kyber-link__text" href={this.docUrl('Integrations-DappsUseCase', '')}>DApps</a>
                <a className="kyber-link__text" href={this.docUrl('Integrations-VendorsUseCase', '')}>Vendors</a>
                <a className="kyber-link__text" href={this.docUrl('Integrations-WalletsUseCase', '')}>Wallets</a>
                <a className="kyber-link__text" href={this.docUrl('Integrations-PlatformFees', '')}>Platform Fees</a>
              </div>
              <div className="kyber-link">
                <span className="kyber-link__text semi-b">Reserves</span>
                <a className="kyber-link__text" href={this.docUrl('Reserves-DynamicMarketMaker', '')}>DMM</a>
                <a className="kyber-link__text" href={this.docUrl('Reserves-FedPriceReserve', '')}>Fed Price</a>
                <a className="kyber-link__text" href={this.docUrl('Reserves-AutomatedPriceReserve', '')}>Automated Price</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-under">
          <div className="wrapper">
            <div className="copyright">
              <span>© 2019 Kyber Network. All rights reserved.</span>
            </div>
            <div className="media">
              <div className="social-icons">
                <a className="social-icons__icon" href="https://www.facebook.com/kybernetwork" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/facebook.svg`} />
                  <div className="social-icons__icon-tooltip">Follow us on Facebook</div>
                </a>
                <a className="social-icons__icon" href="https://twitter.com/kybernetwork" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/twitter.svg`} />
                  <div className="social-icons__icon-tooltip">Follow us on Twitter</div>
                </a>
                <a className="social-icons__icon social-icons__icon--without-circle" href="https://github.com/kybernetwork" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/github.svg`} />
                  <div className="social-icons__icon-tooltip">Follow us on Github</div>
                </a>
                <a className="social-icons__icon social-icons__icon--without-circle" href="https://www.reddit.com/r/kybernetwork/" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/reddit.svg`} />
                  <div className="social-icons__icon-tooltip">Follow us on Reddit</div>
                </a>
                <a className="social-icons__icon social-icons__icon--without-circle" href="https://t.me/kybernetwork" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/telegram.svg`} />
                  <div className="social-icons__icon-tooltip">Join our Telegram group</div>
                </a>
                <a className="social-icons__icon" href="https://www.youtube.com/channel/UCQ-8mEqsKM3x9dTT6rrqgJw" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/youtube.svg`} />
                  <div className="social-icons__icon-tooltip">Subscribe to our Youtube channel</div>
                </a>
                <a className="social-icons__icon" href="https://blog.kyber.network/" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/medium.svg`} />
                  <div className="social-icons__icon-tooltip">Read our blog on Medium</div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

module.exports = Footer;
