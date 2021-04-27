# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

**Mixins:** Setting, Importing, Wizarding, Waiting, Validating, Plugging, Editing, Logging

## Properties

| Property           | Attribute       | Modifiers | Type                                    | Default                                          | Description                                      |
|--------------------|-----------------|-----------|-----------------------------------------|--------------------------------------------------|--------------------------------------------------|
| `activeTab`        | `activeTab`     |           | `number`                                | 0                                                | The currently active editor tab.                 |
| `canRedo`          |                 | readonly  | `boolean`                               |                                                  |                                                  |
| `canUndo`          |                 | readonly  | `boolean`                               |                                                  |                                                  |
| `currentAction`    | `currentAction` |           | `number`                                | -1                                               | Index of the last [[`EditorAction`]] applied.    |
| `darkThemeUI`      |                 |           | `Switch`                                |                                                  |                                                  |
| `doc`              | `doc`           |           | `XMLDocument \| null`                   | null                                             | The `XMLDocument` to be edited                   |
| `docName`          | `docName`       |           | `string`                                | ""                                               | The name of the current [[`doc`]]                |
| `editors`          |                 | readonly  | `InstalledPlugin[]`                     |                                                  |                                                  |
| `errorUI`          |                 |           | `Snackbar`                              |                                                  |                                                  |
| `fileUI`           |                 |           | `HTMLInputElement`                      |                                                  |                                                  |
| `handleKeyPress`   |                 |           |                                         |                                                  |                                                  |
| `history`          | `history`       |           | `LogEntry[]`                            | []                                               | All [[`LogEntry`]]s received so far through [[`LogEvent`]]s. |
| `iedImport`        |                 |           | `HTMLInputElement`                      |                                                  |                                                  |
| `infoUI`           |                 |           | `Snackbar`                              |                                                  |                                                  |
| `items`            |                 | readonly  | `InstalledPlugin[]`                     |                                                  |                                                  |
| `languageUI`       |                 |           | `Select`                                |                                                  |                                                  |
| `logUI`            |                 |           | `Dialog`                                |                                                  |                                                  |
| `menu`             |                 | readonly  | `(MenuItem \| "divider")[]`             |                                                  |                                                  |
| `menuUI`           |                 |           | `Drawer`                                |                                                  |                                                  |
| `nextAction`       |                 | readonly  | `number`                                |                                                  |                                                  |
| `onLog`            |                 |           |                                         |                                                  |                                                  |
| `onPendingState`   |                 |           |                                         |                                                  |                                                  |
| `pluginDownloadUI` |                 |           | `Dialog`                                |                                                  |                                                  |
| `pluginList`       |                 |           | `List`                                  |                                                  |                                                  |
| `pluginUI`         |                 |           | `Dialog`                                |                                                  |                                                  |
| `previousAction`   |                 | readonly  | `number`                                |                                                  |                                                  |
| `redo`             |                 |           |                                         |                                                  |                                                  |
| `saveUI`           |                 |           | `Dialog`                                |                                                  |                                                  |
| `settings`         | `settings`      | readonly  | `Settings`                              |                                                  | Current [[`Settings`]] in `localStorage`, default to [[`defaults`]]. |
| `settingsUI`       |                 |           | `Dialog`                                |                                                  |                                                  |
| `src`              | `src`           |           | `string`                                |                                                  | The current file's URL. `blob:` URLs are *revoked after parsing*! |
| `srcIED`           | `srcIED`        |           | `string`                                |                                                  |                                                  |
| `undo`             |                 |           |                                         |                                                  |                                                  |
| `validated`        | `validated`     |           | `Promise<ValidationResult>`             | "Promise.resolve({\n      file: 'untitled.scd',\n      valid: true,\n      code: 0,\n    })" |                                                  |
| `waiting`          | `waiting`       |           | `boolean`                               | false                                            | Whether the element is currently waiting for some async work. |
| `warningUI`        |                 |           | `Snackbar`                              |                                                  |                                                  |
| `wizardUI`         |                 |           | `WizardDialog`                          |                                                  |                                                  |
| `workDone`         |                 |           | `Promise<PromiseSettledResult<void>[]>` | "Promise.allSettled(this.work)"                  | A promise which resolves once all currently pending work is done. |
| `workflow`         |                 |           | `Wizard[]`                              | []                                               | FIFO queue of [[`Wizard`]]s to display.          |

## Methods

| Method             | Type                                             | Description                                      |
|--------------------|--------------------------------------------------|--------------------------------------------------|
| `importIED`        | `(src: string, doc: Document): Promise<void>`    | Loads and parses an `XMLDocument` after [[`srcIED`]] has changed. |
| `performUpdate`    | `(): Promise<void>`                              |                                                  |
| `redo`             | `(): boolean`                                    |                                                  |
| `renderActionItem` | `(me: MenuItem \| "divider"): TemplateResult`    |                                                  |
| `renderDownloadUI` | `(): TemplateResult`                             |                                                  |
| `renderEditorTab`  | `({ name, icon }: InstalledPlugin): TemplateResult` |                                                  |
| `renderLogEntry`   | `(entry: LogEntry, index: number, history: LogEntry[]): TemplateResult` |                                                  |
| `renderMenuItem`   | `(me: MenuItem \| "divider"): TemplateResult`    |                                                  |
| `renderPluginUI`   | `(): TemplateResult`                             |                                                  |
| `reset`            | `(): void`                                       | Resets the history to an empty state.            |
| `setSetting`       | `<T extends "language" \| "theme">(setting: T, value: Settings[T]): void` | Update the `value` of `setting`, storing to `localStorage`. |
| `undo`             | `(): boolean`                                    |                                                  |
| `validate`         | `(doc: XMLDocument, { version, revision, release, fileName, }?: { version?: string \| undefined; revision?: string \| undefined; release?: string \| undefined; fileName?: string \| undefined; }): Promise<void>` |                                                  |
