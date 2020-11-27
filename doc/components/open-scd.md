# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

**Mixins:** Setting, Wizarding, Waiting, Validating, Editing, Logging

## Properties

| Property         | Attribute       | Modifiers | Type                                             | Default                                          | Description                                      |
|------------------|-----------------|-----------|--------------------------------------------------|--------------------------------------------------|--------------------------------------------------|
| `activeTab`      | `activeTab`     |           | `number`                                         | 0                                                | The currently active editor tab.                 |
| `canRedo`        |                 | readonly  | `boolean`                                        |                                                  |                                                  |
| `canUndo`        |                 | readonly  | `boolean`                                        |                                                  |                                                  |
| `currentAction`  | `currentAction` |           | `number`                                         | -1                                               | Index of the last [[`EditorAction`]] applied.    |
| `darkThemeUI`    |                 |           | `Switch`                                         |                                                  |                                                  |
| `doc`            | `doc`           |           | `XMLDocument`                                    | "newEmptySCD()"                                  | The `XMLDocument` to be edited                   |
| `fileUI`         |                 |           | `HTMLInputElement`                               |                                                  |                                                  |
| `handleKeyPress` |                 |           |                                                  |                                                  |                                                  |
| `history`        | `history`       |           | `LogEntry[]`                                     | []                                               | All [[`LogEntry`]]s received so far through [[`LogEvent`]]s. |
| `languageUI`     |                 |           | `Select`                                         |                                                  |                                                  |
| `logUI`          |                 |           | `Dialog`                                         |                                                  |                                                  |
| `menu`           |                 |           | `MenuEntry[]`                                    | [{"icon":"folder_open","name":"menu.open","startsGroup":true,"actionItem":true},{"icon":"create_new_folder","name":"menu.new"},{"icon":"snippet_folder","name":"menu.importIED"},{"icon":"save","name":"save"},{"icon":"undo","name":"undo","startsGroup":true,"actionItem":true,"action":true},{"icon":"redo","name":"redo","actionItem":true,"action":true},{"icon":"rule_folder","name":"menu.validate","startsGroup":true},{"icon":"rule","name":"menu.viewLog","actionItem":true},{"icon":"settings","name":"settings.name","startsGroup":true}] |                                                  |
| `menuUI`         |                 |           | `Drawer`                                         |                                                  |                                                  |
| `messageUI`      |                 |           | `Snackbar`                                       |                                                  |                                                  |
| `name`           | `name`          | readonly  | `string \| null`                                 |                                                  | The name of the first `Substation` in the current [[`doc`]]. |
| `nextAction`     |                 | readonly  | `number`                                         |                                                  |                                                  |
| `onLog`          |                 |           |                                                  |                                                  |                                                  |
| `onPendingState` |                 |           |                                                  |                                                  |                                                  |
| `plugins`        |                 |           | `{ editors: { name: string; id: string; icon: TemplateResult; getContent: () => Promise<TemplateResult>; }[]; }` | {"editors":[{"name":"substation.name","id":"substation","icon":"zeroLineIcon"}]} |                                                  |
| `previousAction` |                 | readonly  | `number`                                         |                                                  |                                                  |
| `redo`           |                 |           |                                                  |                                                  |                                                  |
| `settings`       | `settings`      | readonly  | `Settings`                                       |                                                  | Current [[`Settings`]] in `localStorage`, default to [[`defaults`]]. |
| `settingsUI`     |                 |           | `Dialog`                                         |                                                  |                                                  |
| `src`            | `src`           |           | `string`                                         |                                                  | The current file's URL. `blob:` URLs are *revoked after parsing*! |
| `srcName`        | `srcName`       |           | `string`                                         | "untitled.scd"                                   | The name of the current file.                    |
| `undo`           |                 |           |                                                  |                                                  |                                                  |
| `validated`      | `validated`     |           | `Promise<ValidationResult>`                      | "Promise.resolve({\n      file: 'untitled.scd',\n      valid: true,\n      code: 0,\n    })" |                                                  |
| `waiting`        | `waiting`       |           | `boolean`                                        | false                                            | Whether the element is currently waiting for some async work. |
| `wizardUI`       |                 |           | `WizardDialog`                                   |                                                  |                                                  |
| `workDone`       |                 |           | `Promise<PromiseSettledResult<string>[]>`        | "Promise.allSettled(this.work)"                  | A promise which resolves once all currently pending work is done. |
| `workflow`       |                 |           | `Wizard[]`                                       | []                                               | FIFO queue of [[`Wizard`]]s to display.          |

## Methods

| Method             | Type                                             | Description                                      |
|--------------------|--------------------------------------------------|--------------------------------------------------|
| `performUpdate`    | `(): Promise<void>`                              |                                                  |
| `redo`             | `(): boolean`                                    |                                                  |
| `renderActionItem` | `(me: MenuEntry): TemplateResult`                |                                                  |
| `renderEditorTab`  | `({ name, id, icon, }: { name: string; id: string; icon: string \| TemplateResult; }): TemplateResult` |                                                  |
| `renderHistory`    | `(): TemplateResult \| TemplateResult[]`         |                                                  |
| `renderLogEntry`   | `(entry: LogEntry, index: number, history: LogEntry[]): TemplateResult` |                                                  |
| `renderMenuEntry`  | `(me: MenuEntry): TemplateResult`                |                                                  |
| `reset`            | `(): void`                                       | Resets the history to an empty state.            |
| `setSetting`       | `<T extends "language" \| "theme">(setting: T, value: Settings[T]): void` | Update the `value` of `setting`, storing to `localStorage`. |
| `undo`             | `(): boolean`                                    |                                                  |
| `validate`         | `(doc: XMLDocument, { version, revision, release, fileName, }?: { version?: string \| undefined; revision?: string \| undefined; release?: string \| undefined; fileName?: string \| undefined; }): Promise<ValidationResult>` |                                                  |
