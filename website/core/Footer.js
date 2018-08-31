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
    return `${baseUrl}docs/${(language ? `${language}/` : '')}${doc}`;
  }

  pageUrl(doc, language) {
    const { baseUrl } = this.props.config.baseUrl;
    return `${baseUrl}${(language ? `${language}/` : '')}${doc}`;
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
                <a className="kyber-link__text semi-b" href="https://kyber.network/swap">KyberSwap</a>
              </div>
              <div className="kyber-link">
                <a className="kyber-link__text semi-b" href="http://developer.kyber.network">
                  <span className="translation_missing" title="translation missing: en.components.footer-application.kyber_developer">Kyber Developer</span>
                </a>
              </div>
              <div className="kyber-link">
                <a className="kyber-link__text semi-b" href="#">About</a>
                <a className="kyber-link__text" href="https://kyber.network/about/company">Kyber Network</a>
                <a className="kyber-link__text" href="https://kyber.network/about/knc">KNC</a>
                <a className="kyber-link__text" href="https://blog.kyber.network">Blog</a>
                <a className="kyber-link__text" href="https://tracker.kyber.network/">Tracker</a>
              </div>
              <div className="kyber-link">
                <a className="kyber-link__text semi-b" href="https://kyber.network/careers">Careers</a>
                <a className="kyber-link__text semi-b" href="https://kybernetwork.zendesk.com/hc/en-us/sections/360000119052-FAQ">FAQ</a>
                <a className="kyber-link__text semi-b" href="mailto:support@kyber.network">Contact Us</a>
              </div>
            </div>
          </div>
        </div>
        <div className="footer-under">
          <div className="wrapper">
            <div className="copyright">
              <span>@ 2018 Kyber Network. All rights reserved.</span>
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
                <a className="social-icons__icon" href="https://kybernetwork.zendesk.com/hc/en-us/requests/new" target="_blank">
                  <img src={`${this.props.config.baseUrl}img/email.svg`} />
                  <div className="social-icons__icon-tooltip">Submit a request</div>
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
