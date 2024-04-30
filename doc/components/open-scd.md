# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

## Properties

| Property           | Attribute   | Modifiers | Type                          | Default             | Description                                      |
|--------------------|-------------|-----------|-------------------------------|---------------------|--------------------------------------------------|
| `activeTab`        | `activeTab` |           | `number`                      | 0                   | The currently active editor tab.                 |
| `bottomMenu`       |             | readonly  | `Plugin[]`                    |                     |                                                  |
| `canRedo`          |             |           | `boolean`                     | false               |                                                  |
| `canUndo`          |             |           | `boolean`                     | false               |                                                  |
| `doc`              |             |           | `XMLDocument \| null`         | null                |                                                  |
| `docId`            | `docId`     |           | `string`                      | ""                  | The UUID of the current [[`doc`]]                |
| `docName`          | `docName`   |           | `string`                      | ""                  | The name of the current [[`doc`]]                |
| `docs`             |             | readonly  | `Record<string, XMLDocument>` |                     |                                                  |
| `editCount`        |             |           | `number`                      | -1                  | Index of the last [[`EditorAction`]] applied.    |
| `editors`          |             | readonly  | `Plugin[]`                    |                     |                                                  |
| `handleKeyPress`   |             |           |                               |                     |                                                  |
| `menu`             |             | readonly  | `(MenuItem \| "divider")[]`   |                     |                                                  |
| `menuEntries`      |             | readonly  | `Plugin[]`                    |                     |                                                  |
| `menuUI`           |             |           | `Drawer`                      |                     |                                                  |
| `middleMenu`       |             | readonly  | `Plugin[]`                    |                     |                                                  |
| `nsdoc`            |             |           | `Nsdoc`                       | "initializeNsdoc()" | Object containing all *.nsdoc files and a function extracting element's label form them |
| `pluginDownloadUI` |             |           | `Dialog`                      |                     |                                                  |
| `pluginList`       |             |           | `List`                        |                     |                                                  |
| `pluginUI`         |             |           | `Dialog`                      |                     |                                                  |
| `src`              | `src`       |           | `string`                      |                     | The current file's URL. `blob:` URLs are *revoked after parsing*! |
| `topMenu`          |             | readonly  | `Plugin[]`                    |                     |                                                  |
| `validated`        |             |           | `Promise<void>`               | "Promise.resolve()" |                                                  |
| `validators`       |             | readonly  | `Plugin[]`                    |                     |                                                  |

## Methods

| Method             | Type                                             |
|--------------------|--------------------------------------------------|
| `renderActionItem` | `(me: MenuItem \| "divider"): TemplateResult`    |
| `renderDownloadUI` | `(): TemplateResult`                             |
| `renderEditorTab`  | `({ name, icon }: Plugin): TemplateResult`       |
| `renderHosting`    | `(): TemplateResult`                             |
| `renderMenuItem`   | `(me: MenuItem \| "divider"): TemplateResult`    |
| `renderPlugging`   | `(): TemplateResult`                             |
| `renderPluginKind` | `(type: "editor" \| "menu" \| "validator" \| "top" \| "middle" \| "bottom", plugins: Plugin[]): TemplateResult` |
| `renderPluginUI`   | `(): TemplateResult`                             |
