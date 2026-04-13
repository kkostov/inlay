# inlay

[![Package Version](https://img.shields.io/hexpm/v/inlay)](https://hex.pm/packages/inlay)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/inlay/)


Inlay is a library which renders embedded previews for social links (Mastodon, Pixelfed, Apple Music, Bluesky, Spotify, etc..) as part of ([Blogatto](https://blogat.to/)) content or [Lustre](https://hexdocs.pm/lustre/) views.

## Supported providers

Mastodon, Pixelfed, Apple Music, Bluesky, Spotify, Instagram, OpenStreetMap, SoundCloud, TED, TikTok, Twitch, Twitter/X, Vimeo, and YouTube

## Installation

```sh
gleam add inlay
```

## Configuration

`inlay.new()` has all providers disabled -- you have to opt in to what you need (any other links will fall through and not have an embed). `inlay.default_config()` starts with some providers enabled -- you can opt out of what you don't want.

### Opt-in with `new()`

This is the recommended approach to avoid unexpected embeddings with links on your website.

```gleam
let config =
  inlay.new()
  |> inlay.mastodon(MastodonConfig(servers: ["mastodon.social"]))

case inlay.embed_with(url, config) {
  Some(element) -> element
  None -> html.text("Not embeddable")
}
```

### Disabling providers

```gleam
let config =
  inlay.default_config()
  |> inlay.no_twitter()
  |> inlay.no_tiktok()
```

### Provider-specific config

```gleam
let config =
  inlay.default_config()
  |> inlay.youtube(YoutubeConfig(no_cookie: False))
  |> inlay.twitch(TwitchConfig(parent: "mysite.com"))
  |> inlay.mastodon(MastodonConfig(servers: ["mastodon.social", "fosstodon.org"]))
```

### Bluesky

Bluesky embeds need an AT Protocol URI (`at://did:plc:.../app.bsky.feed.post/...`) to render the rich embed widget. When the post URL already contains a DID handle (e.g. `did:plc:z72i7hdynmk6r22z27h6tvur`), the embed works out of the box with the default config.

For human-readable handles (e.g. `alice.bsky.social`) or custom domains (e.g. `flowvi.be`), you need to provide a `resolve_handle` function that resolves the handle to a DID.

Here is an example (but your implementation may depend on whether you're targetting javascript or erlang):

```gleam
import gleam/dynamic/decode
import gleam/httpc
import gleam/http/request
import gleam/json
import gleam/option.{Some}
import gleam/result
import inlay.{BlueskyConfig}

let resolve = fn(handle) {
  let url =
    "https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle="
    <> handle
  use req <- result.try(request.to(url) |> result.replace_error(Nil))
  use resp <- result.try(httpc.send(req) |> result.replace_error(Nil))
  json.parse(resp.body, decode.at(["did"], decode.string))
  |> result.replace_error(Nil)
}

let config =
  inlay.default_config()
  |> inlay.bluesky(BlueskyConfig(resolve_handle: Some(resolve)))
```

## Lustre

Get an embedded view in a Lustre component:

```gleam
import gleam/option.{None, Some}
import inlay
import lustre/element/html

pub fn view(url: String) {
  case inlay.detect(url) {
    Some(embed) -> inlay.render(embed)
    None -> html.p([], [html.text(url)])
  }
}
```

### `embed()`

Render an embed for the provided url:

```gleam
case inlay.embed("https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8") {
  Some(element) -> element
  None -> html.text("Not embeddable")
}
```

### `detect()` + `render()`

When you need access to the `Embed` value before rendering (e.g. for pattern matching):

```gleam
case inlay.detect("https://youtu.be/dQw4w9WgXcQ") {
  Some(embed) -> inlay.render(embed)
  None -> html.text("Not embeddable")
}
```

### Pattern matching on `Embed`

The `Embed` type is a public tagged union, so you can match on it for per-provider control:

```gleam
case inlay.detect(url) {
  Some(inlay.YoutubeVideo(id, ..)) -> custom_youtube_player(id)
  Some(inlay.SpotifyMedia(..) as embed) -> html.div([class("spotify-wrapper")], [inlay.render(embed)])
  Some(embed) -> inlay.render(embed)
  None -> html.a([attribute.href(url)], [html.text(url)])
}
```

### Server-side rendering

Lustre elements can be rendered to HTML strings:

```gleam
case inlay.embed("https://vimeo.com/148751763") {
  Some(el) -> element.to_string(el)
  None -> "<p>Not embeddable</p>"
}
```

## Blogatto

[Blogatto](https://blogat.to/)'s markdown renderer lets you replace how specific HTML tags are produced. Inlay provides a custom `<a>` tag handler -- when the href points to an embeddable URL, the link is replaced with an embedded preview. Non-embeddable links pass through to a fallback function. You can intercept and further customize this behavior if needed.

### `a_component_default()`

Default handler with standard anchor fallback:

```gleam
let md =
  markdown.default()
  |> markdown.markdown_path("./blog")
  |> markdown.a(inlay.a_component_default())
```

### `a_component(fallback)`

If Inlay doesn't render an embed, you can control what happens to the link with a custom fallback.

For example, let's make sure external links open in a new tab:

```gleam
let my_a = fn(href, title, children) {
  let attrs = case string.starts_with(href, "http") {
    True -> [attribute.href(href), attribute.target("_blank"),
             attribute.attribute("rel", "noopener noreferrer")]
    False -> [attribute.href(href)]
  }
  let attrs = case title {
    Some(t) -> [attribute.title(t), ..attrs]
    None -> attrs
  }
  html.a(attrs, children)
}

let md =
  markdown.default()
  |> markdown.markdown_path("./blog")
  |> markdown.a(inlay.a_component(my_a))
```

## Development

```sh
gleam test  # Run the tests
gleam build # Build for both Erlang and JavaScript targets
```

Further documentation can be found at <https://hexdocs.pm/inlay>.
