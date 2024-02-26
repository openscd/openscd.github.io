# oscd-settings

## Properties

| Property      | Attribute  | Modifiers | Type          | Description                                      |
|---------------|------------|-----------|---------------|--------------------------------------------------|
| `darkThemeUI` |            |           | `Switch`      |                                                  |
| `host`        | `host`     |           | `HTMLElement` |                                                  |
| `languageUI`  |            |           | `Select`      |                                                  |
| `modeUI`      |            |           | `Switch`      |                                                  |
| `nsdoc`       | `nsdoc`    |           | `Nsdoc`       |                                                  |
| `settings`    | `settings` | readonly  | `Settings`    | Current [[`Settings`]] in `localStorage`, default to [[`defaults`]]. |
| `settingsUI`  |            |           | `Dialog`      |                                                  |
| `showiedsUI`  |            |           | `Switch`      |                                                  |

## Methods

| Method          | Type                                             | Description                                      |
|-----------------|--------------------------------------------------|--------------------------------------------------|
| `removeSetting` | `<T extends "language" \| "theme" \| "mode" \| "showieds" \| "IEC 61850-7-2" \| "IEC 61850-7-3" \| "IEC 61850-7-4" \| "IEC 61850-8-1">(setting: T): void` | Remove the `setting` in `localStorage`.          |
| `setSetting`    | `<T extends "language" \| "theme" \| "mode" \| "showieds" \| "IEC 61850-7-2" \| "IEC 61850-7-3" \| "IEC 61850-7-4" \| "IEC 61850-8-1">(setting: T, value: Settings[T]): void` | Update the `value` of `setting`, storing to `localStorage`. |
