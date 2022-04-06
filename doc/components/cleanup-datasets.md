# cleanup-datasets

An editor component for cleaning SCL datasets.

## Properties

| Property               | Attribute              | Type                          | Default | Description                                      |
|------------------------|------------------------|-------------------------------|---------|--------------------------------------------------|
| `cleanupButton`        |                        | `Button`                      |         |                                                  |
| `dataSetItems`         |                        | `ListItem[] \| undefined`     |         |                                                  |
| `dataSetList`          |                        | `List \| undefined`           |         |                                                  |
| `disableDataSetClean`  | `disableDataSetClean`  | `boolean`                     | false   |                                                  |
| `doc`                  | `doc`                  | `XMLDocument`                 |         | The document being edited as provided to plugins by [[`OpenSCD`]]. |
| `selectedDatasetItems` | `selectedDatasetItems` | `number \| Set<number> \| []` | []      |                                                  |
| `unreferencedDataSets` | `unreferencedDataSets` | `Element[]`                   | []      |                                                  |
