# subnetwork-editor

[[`Communication`]] subeditor for a `SubNetwork` element.

## Properties

| Property  | Attribute | Modifiers | Type             |
|-----------|-----------|-----------|------------------|
| `bitrate` | `bitrate` | readonly  | `string \| null` |
| `desc`    | `desc`    | readonly  | `string \| null` |
| `element` | `element` |           | `Element`        |
| `name`    | `name`    | readonly  | `string`         |
| `type`    | `type`    | readonly  | `string \| null` |

## Methods

| Method                  | Type                   |
|-------------------------|------------------------|
| `openConnectedAPwizard` | `(): void`             |
| `openEditWizard`        | `(): void`             |
| `remove`                | `(): void`             |
| `renderBla`             | `(): TemplateResult[]` |
| `renderHeader`          | `(): TemplateResult`   |
| `renderSubNetworkSpecs` | `(): TemplateResult`   |
