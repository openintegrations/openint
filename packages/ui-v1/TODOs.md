# TODOs

- [ ] Extract `SearchInput` into its own ui-v1/components
- [x] Add a connector config story to the SimpleTable component
- [/] `ConnectorTableCell` component, and `ui-v1/Connector/TableCell` (or maybe this is just a card variant)
- [/] `ConnectorConfigTableColumns` centralizing how to display each column for a connector and `ui-v1/Connector/TableColumns` stories that shows it off.

- [x] `SimpleDataTable` should use latest `@tanstack/react-table` , need to install dependency
- [x] Adding call to action to data table
- [ ] Learn about React 19 `Suspense` and `ErrorBoundary` and how it eliminates loading and error state handling from individual component

# Principles

- ...
- ...
- Each domain model should have a set of components corresponding to it (Card, Form, etc. )
- Avoid use of `any`, use specific types
