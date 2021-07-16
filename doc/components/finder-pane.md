# finder-pane

## Properties

| Property      | Attribute | Type                                     | Default                                          |
|---------------|-----------|------------------------------------------|--------------------------------------------------|
| `container`   |           | `Element`                                |                                                  |
| `getChildren` |           | `(path: string[]) => Promise<Directory>` | "async () => {\n    return { content: html``, children: [] };\n  }" |
| `loaded`      |           | `Promise<void>`                          | "Promise.resolve()"                              |
| `path`        | `path`    | `string[]`                               | []                                               |

## Methods

| Method            | Type                                             |
|-------------------|--------------------------------------------------|
| `renderDirectory` | `(parent: string, index: number): Promise<TemplateResult>` |
| `select`          | `(event: SingleSelectedEvent, index: number): Promise<void>` |
