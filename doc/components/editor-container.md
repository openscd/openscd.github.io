# editor-container

A responsive container for nested elements with header and
create new child functionality.

## Properties

| Property          | Attribute     | Modifiers | Type                         | Default | Description                                      |
|-------------------|---------------|-----------|------------------------------|---------|--------------------------------------------------|
| `addIcon`         |               |           | `IconButton \| undefined`    |         |                                                  |
| `addMenu`         |               |           | `Menu`                       |         |                                                  |
| `container`       |               |           | `HTMLElement`                |         |                                                  |
| `contrasted`      | `contrasted`  |           | `boolean`                    | false   | Whether different background color shall be used |
| `defaultHeader`   |               | readonly  | `string`                     |         |                                                  |
| `element`         | `element`     |           | `Element \| null`            | null    | The visualized `Element`.                        |
| `header`          | `header`      |           | `string`                     | ""      | Overwrites default header text                   |
| `headerContainer` |               |           | `HTMLElement`                |         |                                                  |
| `highlighted`     | `highlighted` |           | `boolean`                    | false   | Wether outline shall be permanent                |
| `level`           | `level`       |           | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | 1       | Sets the header type h1, h2, h3, h4, h5 or h6    |
| `moreVert`        |               |           | `IconButton \| undefined`    |         |                                                  |
| `nomargin`        | `nomargin`    |           | `boolean`                    | false   | Whether the container does not have margins      |
| `secondary`       | `secondary`   |           | `boolean`                    | false   | Sets the focused header color                    |
