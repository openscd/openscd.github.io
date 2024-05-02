# open-scd

The `<open-scd>` custom element is the main entry point of the
Open Substation Configuration Designer.

## Properties

| Property    | Attribute | Modifiers | Type                          | Default             | Description                                      |
|-------------|-----------|-----------|-------------------------------|---------------------|--------------------------------------------------|
| `doc`       |           |           | `XMLDocument \| null`         | null                |                                                  |
| `docId`     | `docId`   |           | `string`                      | ""                  | The UUID of the current [[`doc`]]                |
| `docName`   | `docName` |           | `string`                      | ""                  | The name of the current [[`doc`]]                |
| `docs`      |           | readonly  | `Record<string, XMLDocument>` |                     |                                                  |
| `editCount` |           |           | `number`                      | -1                  | Index of the last [[`EditorAction`]] applied.    |
| `nsdoc`     |           |           | `Nsdoc`                       | "initializeNsdoc()" | Object containing all *.nsdoc files and a function extracting element's label form them |
| `plugins`   |           |           | `Plugin[]`                    |                     |                                                  |
| `src`       | `src`     |           | `string`                      |                     | The current file's URL. `blob:` URLs are *revoked after parsing*! |
