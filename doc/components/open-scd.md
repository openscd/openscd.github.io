# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

**Mixins:** Hosting, Setting, Wizarding, Waiting, Plugging, Editing, Logging

## Properties

| Property             | Attribute       | Modifiers | Type                                    | Default                         | Description                                      |
|----------------------|-----------------|-----------|-----------------------------------------|---------------------------------|--------------------------------------------------|
| `activeTab`          | `activeTab`     |           | `number`                                | 0                               | The currently active editor tab.                 |
| `canRedo`            |                 | readonly  | `boolean`                               |                                 |                                                  |
| `canUndo`            |                 | readonly  | `boolean`                               |                                 |                                                  |
| `currentAction`      | `currentAction` |           | `number`                                | -1                              | Index of the last [[`EditorAction`]] applied.    |
| `darkThemeUI`        |                 |           | `Switch`                                |                                 |                                                  |
| `doc`                |                 |           | `XMLDocument \| null`                   | null                            | The `XMLDocument` to be edited                   |
| `docId`              | `docId`         |           | `string`                                | ""                              | The UUID of the current [[`doc`]]                |
| `docName`            | `docName`       |           | `string`                                | ""                              | The name of the current [[`doc`]]                |
| `editors`            |                 | readonly  | `InstalledPlugin[]`                     |                                 |                                                  |
| `errorUI`            |                 |           | `Snackbar`                              |                                 |                                                  |
| `handleKeyPress`     |                 |           |                                         |                                 |                                                  |
| `history`            | `history`       |           | `LogEntry[]`                            | []                              | All [[`LogEntry`]]s received so far through [[`LogEvent`]]s. |
| `infoUI`             |                 |           | `Snackbar`                              |                                 |                                                  |
| `languageUI`         |                 |           | `Select`                                |                                 |                                                  |
| `loaders`            |                 | readonly  | `InstalledPlugin[]`                     |                                 |                                                  |
| `logUI`              |                 |           | `Dialog`                                |                                 |                                                  |
| `menu`               |                 | readonly  | `(MenuItem \| "divider")[]`             |                                 |                                                  |
| `menuUI`             |                 |           | `Drawer`                                |                                 |                                                  |
| `nextAction`         |                 | readonly  | `number`                                |                                 |                                                  |
| `officialPluginList` |                 |           | `List`                                  |                                 |                                                  |
| `onLog`              |                 |           |                                         |                                 |                                                  |
| `onPendingState`     |                 |           |                                         |                                 |                                                  |
| `pluginDownloadUI`   |                 |           | `Dialog`                                |                                 |                                                  |
| `pluginUI`           |                 |           | `Dialog`                                |                                 |                                                  |
| `previousAction`     |                 | readonly  | `number`                                |                                 |                                                  |
| `redo`               |                 |           |                                         |                                 |                                                  |
| `reset`              |                 |           |                                         |                                 |                                                  |
| `savers`             |                 | readonly  | `InstalledPlugin[]`                     |                                 |                                                  |
| `settings`           | `settings`      | readonly  | `Settings`                              |                                 | Current [[`Settings`]] in `localStorage`, default to [[`defaults`]]. |
| `settingsUI`         |                 |           | `Dialog`                                |                                 |                                                  |
| `src`                | `src`           |           | `string`                                |                                 | The current file's URL. `blob:` URLs are *revoked after parsing*! |
| `triggered`          |                 | readonly  | `InstalledPlugin[]`                     |                                 |                                                  |
| `undo`               |                 |           |                                         |                                 |                                                  |
| `validated`          |                 |           | `Promise<unknown>`                      | "Promise.resolve()"             |                                                  |
| `validators`         |                 | readonly  | `InstalledPlugin[]`                     |                                 |                                                  |
| `waiting`            | `waiting`       |           | `boolean`                               | false                           | Whether the element is currently waiting for some async work. |
| `warningUI`          |                 |           | `Snackbar`                              |                                 |                                                  |
| `wizardUI`           |                 |           | `WizardDialog`                          |                                 |                                                  |
| `workDone`           |                 |           | `Promise<PromiseSettledResult<void>[]>` | "Promise.allSettled(this.work)" | A promise which resolves once all currently pending work is done. |
| `workflow`           |                 |           | `Wizard[]`                              | []                              | FIFO queue of [[`Wizard`]]s to display.          |

## Methods

| Method             | Type                                             | Description                                      |
|--------------------|--------------------------------------------------|--------------------------------------------------|
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
