# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025.11.06

### Added

- Manually add eventStack tracking code to valid functions using:
  - Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
  - Context Menu (right-click in editor)
  - Keyboard shortcut (`Ctrl+Shift+E Ctrl+Shift+S` / `Cmd+Shift+E Cmd+Shift+S`)

## [1.0.1] - 2025.11.03

### Added

- Test codes for automatic eventStack addition.

## [1.0.0] - 2025.10.31

### Added

- Initial release of EventStack Helper for VSCode.
- Function to automatically add eventStack.
  - Automatically adds eventStack tracking code to newly created functions when files are saved.
  - Configuration options:
    - `eventstack-helper.autoAddEventStack`: Enable/disable automatic addition (default: true)
    - `eventstack-helper.allowedFilePatterns`: File patterns to process (default: `**/*.js`, `**/*.ts`, `**/*.vue`)
    - `eventstack-helper.eventStackFunctionName`: Custom eventStack function name(default: `window.eventStack.set`)
