# oscd-history

## Properties

| Property             | Attribute   | Modifiers | Type                         | Default                            | Description                                      |
|----------------------|-------------|-----------|------------------------------|------------------------------------|--------------------------------------------------|
| `canRedo`            |             | readonly  | `boolean`                    |                                    |                                                  |
| `canUndo`            |             | readonly  | `boolean`                    |                                    |                                                  |
| `diagnoses`          | `diagnoses` |           | `Map<string, IssueDetail[]>` | "new Map<string, IssueDetail[]>()" |                                                  |
| `diagnosticUI`       |             |           | `Dialog`                     |                                    |                                                  |
| `editCount`          | `editCount` |           | `number`                     | -1                                 | Index of the last [[`EditorAction`]] applied.    |
| `emptyIssuesHandler` |             |           |                              |                                    |                                                  |
| `errorUI`            |             |           | `Snackbar`                   |                                    |                                                  |
| `handleKeyPress`     |             |           |                              |                                    |                                                  |
| `history`            | `history`   |           | `CommitEntry[]`              | []                                 | All [[`CommitEntry`]]s received so far through [[`LogEvent`]]s |
| `historyUI`          |             |           | `Dialog`                     |                                    |                                                  |
| `historyUIHandler`   |             |           |                              |                                    |                                                  |
| `host`               | `host`      |           | `HTMLElement`                |                                    |                                                  |
| `infoUI`             |             |           | `Snackbar`                   |                                    |                                                  |
| `issueUI`            |             |           | `Snackbar`                   |                                    |                                                  |
| `latestIssue`        |             |           | `IssueDetail`                |                                    |                                                  |
| `log`                | `log`       |           | `InfoEntry[]`                | []                                 | All [[`LogEntry`]]s received so far through [[`LogEvent`]]s. |
| `logUI`              |             |           | `Dialog`                     |                                    |                                                  |
| `nextAction`         |             | readonly  | `number`                     |                                    |                                                  |
| `onIssue`            |             |           |                              |                                    |                                                  |
| `onLog`              |             |           |                              |                                    |                                                  |
| `previousAction`     |             | readonly  | `number`                     |                                    |                                                  |
| `redo`               |             |           |                              |                                    |                                                  |
| `undo`               |             |           |                              |                                    |                                                  |
| `warningUI`          |             |           | `Snackbar`                   |                                    |                                                  |

## Methods

| Method                   | Type                                             |
|--------------------------|--------------------------------------------------|
| `redo`                   | `(): boolean`                                    |
| `renderHistoryEntry`     | `(entry: CommitEntry, index: number, history: LogEntry[]): TemplateResult` |
| `renderLogEntry`         | `(entry: InfoEntry, index: number, log: LogEntry[]): TemplateResult` |
| `renderValidatorsIssues` | `(issues: IssueDetail[]): TemplateResult[]`      |
| `undo`                   | `(): boolean`                                    |
