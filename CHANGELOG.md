All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [v1.0.1]() (2026-11-13)

### Bug Fixes
* Code blocks fenced with four or five backticks now copy correctly. Previously the copied text started with a stray backtick and the language name, and stopped at the first ``` line inside the block. Thanks to @WalnutDerwin ([#8](https://github.com/8bitgentleman/roam-depot-copy-code-block/pull/8))

### Maintenance
* Updated the webpack build toolchain
* Added unit tests for code fence parsing
