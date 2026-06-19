# inlay custom elements example

A tiny browser app that registers inlay's `<inlay-embed>` custom element and
renders a few embeds.

## Run

This uses [`lustre_dev_tools`](https://hexdocs.pm/lustre_dev_tools) (a dev
dependency) to start a dev server with live reloading:

```sh
gleam run -m lustre/dev start
```

Open the URL it prints (default <http://localhost:1234>). The dev server
generates the page, mounts the app from `src/inlay_components.gleam`, and
reloads the browser whenever you edit a source file.

To produce a static bundle in `dist/` instead:

```sh
gleam run -m lustre/dev build
```
