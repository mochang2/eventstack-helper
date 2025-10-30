# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2025.08.31

### Added

- Initial release of EventStack Helper for VSCode.
- Automatic eventStack injection.
  - Automatically adds eventStack tracking code to newly created functions when files are saved.
  - Configuration options:
    - `eventstack-helper.autoAddEventStack`: Enable/disable automatic addition (default: true)
    - `eventstack-helper.allowedFilePatterns`: File patterns to process (default: `**/*.js`, `**/*.ts`, `**/*.vue`)
    - `eventstack-helper.eventStackFunctionName`: Custom eventStack function name(default: `window.eventStack.set`)
