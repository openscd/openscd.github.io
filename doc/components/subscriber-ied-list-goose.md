# subscriber-ied-list-goose

An sub element for subscribing and unsubscribing IEDs to GOOSE messages.

## Properties

| Property                 | Type          |
|--------------------------|---------------|
| `doc`                    | `XMLDocument` |
| `onGOOSEDataSetEvent`    |               |
| `onIEDSubscriptionEvent` |               |
| `subscriberWrapper`      | `Element`     |

## Methods

| Method                       | Type                                             |
|------------------------------|--------------------------------------------------|
| `renderFullSubscribers`      | `(): TemplateResult`                             |
| `renderPartiallySubscribers` | `(ieds: IED[]): TemplateResult`                  |
| `renderSubscriber`           | `(status: SubscribeStatus, element: Element): TemplateResult` |
| `renderUnSubscribers`        | `(ieds: IED[]): TemplateResult`                  |
