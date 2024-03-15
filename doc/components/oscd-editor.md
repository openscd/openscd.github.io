# oscd-editor

## Properties

| Property    | Attribute   | Type                  | Default | Description                       |
|-------------|-------------|-----------------------|---------|-----------------------------------|
| `doc`       |             | `XMLDocument \| null` | null    | The `XMLDocument` to be edited    |
| `docId`     | `docId`     | `string`              | ""      | The UUID of the current [[`doc`]] |
| `docName`   | `docName`   | `string`              | ""      | The name of the current [[`doc`]] |
| `editCount` | `editCount` | `number`              | -1      |                                   |
| `host`      | `host`      | `HTMLElement`         |         |                                   |

## Methods

| Method          | Type                                             |
|-----------------|--------------------------------------------------|
| `handleOpenDoc` | `({ detail: { docName, doc } }: OpenEvent): void` |
