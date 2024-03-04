# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

**Mixins:** Plugging, Editing, Historing

## Properties

| Property           | Attribute   | Modifiers | Type                          | Default                            | Description                                      |
|--------------------|-------------|-----------|-------------------------------|------------------------------------|--------------------------------------------------|
| `activeTab`        | `activeTab` |           | `number`                      | 0                                  | The currently active editor tab.                 |
| `bottomMenu`       |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `canRedo`          |             | readonly  | `boolean`                     |                                    |                                                  |
| `canUndo`          |             | readonly  | `boolean`                     |                                    |                                                  |
| `diagnoses`        | `diagnoses` |           | `Map<string, IssueDetail[]>`  | "new Map<string, IssueDetail[]>()" |                                                  |
| `diagnosticUI`     |             |           | `Dialog`                      |                                    |                                                  |
| `doc`              |             |           | `XMLDocument \| null`         | null                               | The `XMLDocument` to be edited                   |
| `docId`            | `docId`     |           | `string`                      | ""                                 | The UUID of the current [[`doc`]]                |
| `docName`          | `docName`   |           | `string`                      | ""                                 | The name of the current [[`doc`]]                |
| `docs`             |             | readonly  | `Record<string, XMLDocument>` |                                    |                                                  |
| `editCount`        | `editCount` |           | `number`                      | -1                                 | Index of the last [[`EditorAction`]] applied.    |
| `editors`          |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `errorUI`          |             |           | `Snackbar`                    |                                    |                                                  |
| `handleKeyPress`   |             |           |                               |                                    |                                                  |
| `history`          | `history`   |           | `CommitEntry[]`               | []                                 | All [[`CommitEntry`]]s received so far through [[`LogEvent`]]s |
| `historyUI`        |             |           | `Dialog`                      |                                    |                                                  |
| `infoUI`           |             |           | `Snackbar`                    |                                    |                                                  |
| `issueUI`          |             |           | `Snackbar`                    |                                    |                                                  |
| `latestIssue`      |             |           | `IssueDetail`                 |                                    |                                                  |
| `log`              | `log`       |           | `InfoEntry[]`                 | []                                 | All [[`LogEntry`]]s received so far through [[`LogEvent`]]s. |
| `logUI`            |             |           | `Dialog`                      |                                    |                                                  |
| `menu`             |             | readonly  | `(MenuItem \| "divider")[]`   |                                    |                                                  |
| `menuEntries`      |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `menuUI`           |             |           | `Drawer`                      |                                    |                                                  |
| `middleMenu`       |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `nextAction`       |             | readonly  | `number`                      |                                    |                                                  |
| `nsdoc`            |             |           | `Nsdoc`                       | "initializeNsdoc()"                | Object containing all *.nsdoc files and a function extracting element's label form them |
| `onLog`            |             |           |                               |                                    |                                                  |
| `pluginDownloadUI` |             |           | `Dialog`                      |                                    |                                                  |
| `pluginList`       |             |           | `List`                        |                                    |                                                  |
| `pluginUI`         |             |           | `Dialog`                      |                                    |                                                  |
| `previousAction`   |             | readonly  | `number`                      |                                    |                                                  |
| `redo`             |             |           |                               |                                    |                                                  |
| `src`              | `src`       |           | `string`                      |                                    | The current file's URL. `blob:` URLs are *revoked after parsing*! |
| `topMenu`          |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `undo`             |             |           |                               |                                    |                                                  |
| `validated`        |             |           | `Promise<void>`               | "Promise.resolve()"                |                                                  |
| `validators`       |             | readonly  | `Plugin[]`                    |                                    |                                                  |
| `warningUI`        |             |           | `Snackbar`                    |                                    |                                                  |

## Methods

| Method                   | Type                                             |
|--------------------------|--------------------------------------------------|
| `handleOpenDoc`          | `({ detail: { docName, doc } }: OpenEvent): void` |
| `performUpdate`          | `(): Promise<void>`                              |
| `redo`                   | `(): boolean`                                    |
| `renderActionItem`       | `(me: MenuItem \| "divider"): TemplateResult`    |
| `renderDownloadUI`       | `(): TemplateResult`                             |
| `renderEditorTab`        | `({ name, icon }: Plugin): TemplateResult`       |
| `renderHistoryEntry`     | `(entry: CommitEntry, index: number, history: LogEntry[]): TemplateResult` |
| `renderHosting`          | `(): TemplateResult`                             |
| `renderLogEntry`         | `(entry: InfoEntry, index: number, log: LogEntry[]): TemplateResult` |
| `renderMenuItem`         | `(me: MenuItem \| "divider"): TemplateResult`    |
| `renderPluginKind`       | `(type: "menu" \| "editor" \| "validator" \| "top" \| "middle" \| "bottom", plugins: Plugin[]): TemplateResult` |
| `renderPluginUI`         | `(): TemplateResult`                             |
| `renderValidatorsIssues` | `(issues: IssueDetail[]): TemplateResult[]`      |
| `undo`                   | `(): boolean`                                    |
