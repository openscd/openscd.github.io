# process-editor

## Properties

| Property        | Attribute       | Modifiers | Type          | Default | Description                                      |
|-----------------|-----------------|-----------|---------------|---------|--------------------------------------------------|
| `doc`           |                 |           | `XMLDocument` |         | The document being edited as provided to editor by [[`Zeroline`]]. |
| `element`       |                 |           | `Element`     |         | SCL element Process                              |
| `header`        |                 | readonly  | `string`      |         |                                                  |
| `showfunctions` | `showfunctions` |           | `boolean`     | false   | Whether `Function` and `LNode` are rendered      |

## Methods

| Method   | Type       |
|----------|------------|
| `remove` | `(): void` |