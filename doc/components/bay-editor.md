# bay-editor

[[`SubstationEditor`]] subeditor for a `Bay` element.

## Properties

| Property          | Attribute  | Modifiers | Type                                             | Default                              |
|-------------------|------------|-----------|--------------------------------------------------|--------------------------------------|
| `desc`            | `desc`     | readonly  | `string \| null`                                 |                                      |
| `element`         |            |           | `Element`                                        |                                      |
| `getAttachedIeds` |            |           | `((element: Element) => Promise<Element[]>) \| undefined` | "async () => {\n    return [];\n  }" |
| `name`            | `name`     | readonly  | `string`                                         |                                      |
| `readonly`        | `readonly` |           | `boolean`                                        | false                                |

## Methods

| Method                          | Type                          | Description                                      |
|---------------------------------|-------------------------------|--------------------------------------------------|
| `openConductingEquipmentWizard` | `(): void`                    |                                                  |
| `openEditWizard`                | `(): void`                    |                                                  |
| `openLNodeWizard`               | `(): void`                    | Opens a [[`WizardDialog`]] for editing `LNode` connections. |
| `remove`                        | `(): void`                    |                                                  |
| `renderHeader`                  | `(): TemplateResult`          |                                                  |
| `renderIedContainer`            | `(): Promise<TemplateResult>` |                                                  |
