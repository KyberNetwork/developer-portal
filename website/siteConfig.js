/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// See https://docusaurus.io/docs/site-config.html for all the possible
// site configuration options.

const { Plugin: Embed } = require('remarkable-embed');

const createVariableInjectionPlugin = (variables) => {
  // `let` binding used to initialize the `Embed` plugin only once for efficiency.
  // See `if` statement below.
  let initializedPlugin;

  const embed = new Embed();
  embed.register({
    // Call the render method to process the corresponding variable with
    // the passed Remarkable instance.
    // -> the Markdown markup in the variable will be converted to HTML.
    inject: key => initializedPlugin.render(variables[key]),
  });

  return (md, options) => {
    if (!initializedPlugin) {
      initializedPlugin = {
        render: md.render.bind(md),
        hook: embed.hook(md, options),
      };
    }

    return initializedPlugin.hook;
  };
};

// List of global site variables
const siteVariables = {
  // editBaseURL: 'http://developer.kyber.network:1336',
};

// List of projects/orgs using your project for the users page
const users = [
  {
    caption: 'imToken',
    image: 'img/users/imToken.png',
    infoLink: 'https://token.im',
    pinned: true,
  },
  {
    caption: 'Trust Wallet',
    image: 'img/users/TrustWallet.png',
    infoLink: 'https://trustwalletapp.com',
    pinned: true,
  },
];

const siteConfig = {
  // Markdown Plugins
  markdownPlugins: [createVariableInjectionPlugin(siteVariables)],

  // Search bar
  algolia: {
    apiKey: 'da025d0828b58484a96005dfb00595a2',
    indexName: 'kyber',
  },

  // Base details
  title: 'KyberDeveloper · Powering Liquidity for the Ecosystem',
  tagline:
    "Platforms and applications of all sizes can tap into Kyber's decentralized liquidity network to power their liquidity needs, ranging from inter-token payments to portfolio rebalancing.",
  url: 'https://developer.kyber.network',
  baseUrl: '/',
  projectName: 'kyberdeveloper',
  organizationName: 'Kyber Network',
  twitterUsername: 'kybernetwork',

  // Meta card images
  ogImage: 'img/ogImage.png',
  twitterImage: 'img/ogImage.png',

  // This copyright info is used in /core/Footer.js and blog rss/atom feeds.
  copyright: `© ${new Date().getFullYear()} Kyber Network. All rights reserved.`,

  // Remove tagline from title
  disableTitleTagline: true,

  // URL links on header
  headerLinks: [
    {
      doc: 'Katalyst-Intro',
      label: 'Home',
    },
    {
      doc: 'Integrations-Intro',
      label: 'Integrations',
    },
    {
      doc: 'Reserves-Intro',
      label: 'Reserves',
    },
    {
      doc: 'KyberPro-Intro',
      label: 'KyberPro',
    },
    {
      doc: 'Addresses-Intro',
      label: 'Addresses',
    },
    {
      doc: 'API_ABI-Intro',
      label: 'API/ABI',
    },
    {
      href: 'https://developer.kyber.network/tx-diagnose',
      label: 'Trade Debugger',
    },
    {
      href: 'https://tracker.kyber.network',
      label: 'Tracker',
    },
    {
      href: 'https://github.com/kybernetwork',
      label: 'GitHub',
    },
  ],

  // Path to images for header/footer
  headerIcon: 'img/headerIcon.svg',
  footerIcon: 'img/footerIcon.svg',
  favicon: 'img/favicon.png',

  // Colors for website
  colors: {
    primaryColor: '#31CB9E',
    secondaryColor: '#141927',
  },

  // Remove html extension
  cleanUrl: true,

  // editUrl: 'http://ec2-54-254-161-180.ap-southeast-1.compute.amazonaws.com:1336/edit/',

  // Google Analytics tracking ID
  gaTrackingId: 'UA-99578428-4',

  highlight: {
    // Highlight.js theme to use for syntax highlighting in code blocks
    theme: 'default',
  },

  // Add additional syntax highlighting using Prism
  usePrism: ['js', 'jsx', 'json', 'sh'],

  // Add custom scripts here that would be placed in <script> tags
  scripts: [
    'https://buttons.github.io/buttons.js',
    'https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.0/clipboard.min.js',
    '/js/code-block-buttons.js',
  ],

  // Add custom stylesheets here
  stylesheets: ['/css/code-block-buttons.css'],

  // Enable scroll to top
  scrollToTop: true,
  scrollToTopOptions: {
    backgroundColor: '#31CB9E',
  },

  // On page navigation for the current documentation page
  onPageNav: 'separate',

  // Users set above
  users,
};

module.exports = siteConfig;
