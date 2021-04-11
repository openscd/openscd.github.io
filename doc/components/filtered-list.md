# filtered-list

## Properties

| Property           | Attribute          | Modifiers | Type                                             |
|--------------------|--------------------|-----------|--------------------------------------------------|
| `activatable`      |                    |           | `boolean`                                        |
| `debouncedLayout`  |                    |           | `(updateItems?: boolean \| undefined) => void \| undefined` |
| `emptyMessage`     |                    |           | `string \| undefined`                            |
| `index`            |                    | readonly  | `MWCListIndex`                                   |
| `innerAriaLabel`   |                    |           | `string \| null`                                 |
| `innerRole`        |                    |           | `string \| null`                                 |
| `itemRoles`        |                    |           | `string \| null`                                 |
| `items`            |                    | readonly  | `ListItemBase[]`                                 |
| `itemsReady`       |                    |           | `Promise<never[]>`                               |
| `layout`           |                    |           | `(updateItems?: boolean \| undefined) => void`   |
| `multi`            |                    |           | `boolean`                                        |
| `noninteractive`   |                    |           | `boolean`                                        |
| `rootTabbable`     |                    |           | `boolean`                                        |
| `searchField`      |                    |           | `TextField`                                      |
| `searchFieldLabel` | `searchFieldLabel` |           | `string`                                         |
| `selected`         |                    | readonly  | `ListItemBase \| ListItemBase[] \| null`         |
| `wrapFocus`        |                    |           | `boolean`                                        |

## Methods

| Method                | Type                                             |
|-----------------------|--------------------------------------------------|
| `blur`                | `(): void`                                       |
| `click`               | `(): void`                                       |
| `focus`               | `(): void`                                       |
| `focusItemAtIndex`    | `(index: number): void`                          |
| `getFocusedItemIndex` | `(): number`                                     |
| `layout`              | `(updateItems?: boolean \| undefined): void`     |
| `onFilterInput`       | `(): void`                                       |
| `renderPlaceholder`   | `(): TemplateResult \| null`                     |
| `select`              | `(index: MWCListIndex): void`                    |
| `toggle`              | `(index: number, force?: boolean \| undefined): void` |

## Events

| Event           | Type             |
|-----------------|------------------|
| `action`        | `ActionDetail`   |
| `items-updated` |                  |
| `selected`      | `SelectedDetail` |
