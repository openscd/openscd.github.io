# oscd-layout

## Properties

| Property           | Attribute   | Modifiers | Type                        | Default             | Description                                   |
|--------------------|-------------|-----------|-----------------------------|---------------------|-----------------------------------------------|
| `activeTab`        | `activeTab` |           | `number`                    | 0                   | The currently active editor tab.              |
| `bottomMenu`       |             | readonly  | `Plugin[]`                  |                     |                                               |
| `canRedo`          |             |           | `boolean`                   | false               |                                               |
| `canUndo`          |             |           | `boolean`                   | false               |                                               |
| `doc`              |             |           | `XMLDocument \| null`       | null                | The `XMLDocument` to be edited                |
| `docName`          | `docName`   |           | `string`                    | ""                  | The name of the current [[`doc`]]             |
| `editCount`        | `editCount` |           | `number`                    | -1                  | Index of the last [[`EditorAction`]] applied. |
| `editors`          |             | readonly  | `Plugin[]`                  |                     |                                               |
| `host`             | `host`      |           | `HTMLElement`               |                     | The open-scd host element                     |
| `menu`             |             | readonly  | `(MenuItem \| "divider")[]` |                     |                                               |
| `menuEntries`      |             | readonly  | `Plugin[]`                  |                     |                                               |
| `menuUI`           |             |           | `Drawer`                    |                     |                                               |
| `middleMenu`       |             | readonly  | `Plugin[]`                  |                     |                                               |
| `pluginDownloadUI` |             |           | `Dialog`                    |                     |                                               |
| `pluginList`       |             |           | `List`                      |                     |                                               |
| `pluginUI`         |             |           | `Dialog`                    |                     |                                               |
| `plugins`          | `plugins`   |           | `Plugin[]`                  | []                  | The plugins to render the layout.             |
| `shouldValidate`   |             |           | `boolean`                   | false               |                                               |
| `topMenu`          |             | readonly  | `Plugin[]`                  |                     |                                               |
| `validated`        |             |           | `Promise<void>`             | "Promise.resolve()" |                                               |
| `validators`       |             | readonly  | `Plugin[]`                  |                     |                                               |
