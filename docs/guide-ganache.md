---
id: GanacheGuide
title: Testing Using Ganache
---
## Overview

Ganache is...

```sh
ganache-cli --port 8545 --accounts 5 --db ganache-db --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777
```

```sh
Network:
  -p, --port              port to bind to                        [default: 8545]
  -h, --host, -?, --help  Show help             [boolean] [default: "127.0.0.1"]

Accounts:
  -a, --accounts             number of accounts to generate at startup
                                                          [number] [default: 10]
  -e, --defaultBalanceEther  Amount of ether to assign each test account
                                                         [number] [default: 100]
  --account                  Account data in the form
                             '<private_key>,<initial_balance>', can be specified
                             multiple times. Note that private keys are 64
                             characters long and must be entered as an
                             0x-prefixed hex string. Balance can either be input
                             as an integer, or as a 0x-prefixed hex string with
                             either form specifying the initial balance in wei.
                                                                         [array]
  --acctKeys                 saves generated accounts and private keys as JSON
                             object in specified file                   [string]
  -n, --secure               Lock accounts by default [boolean] [default: false]
  --unlock                   Comma-separated list of accounts or indices to
                             unlock

Chain:
  -f, --fork                 URL and block number of another currently running
                             Ethereum client from which this client should fork.
                             Example: 'http://127.0.0.1:9545@12345'
  --db                       directory to save chain db                 [string]
  -s, --seed                 seed value for PRNG
                                 [default: Random value, unless -d is specified]
  -d, --deterministic        uses fixed (hardcoded) seed for identical results
                             from run-to-run          [boolean] [default: false]
  -m, --mnemonic             bip39 mnemonic phrase for generating a PRNG seed,
                             which is in turn used for hierarchical
                             deterministic (HD) account generation
  --noVMErrorsOnRPCResponse  Do not transmit transaction failures as RPC errors.
                             Enable this flag for error reporting behaviour
                             which is compatible with other clients such as geth
                             and Parity.              [boolean] [default: false]
  -b, --blockTime            Block time in seconds. Will instamine if option
                             omitted. Avoid using unless your test cases require
                             a specific mining interval.
  -i, --networkId            Network ID to be returned by 'net_version'.
                               [number] [default: System time at process start.]
  -g, --gasPrice             The price of gas in wei
                                                 [number] [default: 20000000000]
  -l, --gasLimit             The block gas limit     [number] [default: 6721975]

Other:
  --debug    Output VM opcodes for debugging          [boolean] [default: false]
  --verbose  Log all requests and responses to stdout [boolean] [default: false]
  --mem      Only show memory output, not tx history  [boolean] [default: false]

Options:
  --version  Show version number                                       [boolean]
```

Install ganache-cli https://github.com/trufflesuite/ganache-cli/releases
Install ethexplorer https://github.com/ayobuenavista/explorer

Available Accounts
==================
Account 0 - 0x2b522cabe9950d1153c26c1b399b293caa99fcf9\
Account 1 - 0x3644b986b3f5ba3cb8d5627a22465942f8e06d09\
Account 2 - 0x9e8f633d0c46ed7170ef3b30e291c64a91a49c7e\
Account 3 - 0xd1c3bf2f2fd296249228734299290cf8616c1e7c\
Account 4 - 0x47a793d7d0aa5727095c3fe132a6c1a46804c8d2

Private Keys
==================
Account 0 - 1aba488300a9d7297a315d127837be4219107c62c61966ecdf7a75431d75cc61\
Account 1 - 66e56aa2896ef489e42fdf1d8059a1359bd6b6d67c83c69d7dc2ed726778de85\
Account 2 - a088a755d2f0bbf8fc4e5fac3c3b62904e028db8511e4e5af339af40c4e0e16c\
Account 3 - 5a60bad80cd80b0d5d43cd31637c3bc028ad218db40af53d00b0bd2e6359b83a\
Account 4 - 979d8b20000da5832fc99c547393fdfa5eef980c77bfb1decb17c59738d99471

Delete ~/.config/MyCrypto if deploying contracts from scratch

KNC: 0x2fe0423B148739CD9D0E49e07b5ca00d388A15ac
GTO: 0x086112724b05c124AD9b46730C16e4869d820F07
ZIL: 0x8c13AFB7815f10A8333955854E6ec7503eD841B7
