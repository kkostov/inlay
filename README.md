# inlay

[![Package Version](https://img.shields.io/hexpm/v/inlay)](https://hex.pm/packages/inlay)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/inlay/)

Embed media URLs in [Lustre](https://hexdocs.pm/lustre/) views and [Blogatto](https://blogat.to/) markdown. Paste a YouTube, Spotify, or Bluesky link and get a ready-to-render embed element.

Supports 12 providers: YouTube, Vimeo, Spotify, Twitter/X, TikTok, Bluesky, Instagram, Twitch, OpenStreetMap, TED, SoundCloud, and Mastodon.

## Installation

```sh
gleam add inlay@1
```

## Quick start

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

## Usage

### Two-step: detect + render

`detect` parses a URL and returns an `Embed` value identifying the provider and its parsed data. `render` turns that into a Lustre element.

```gleam
case inlay.detect("https://youtu.be/dQw4w9WgXcQ") {
  Some(embed) -> inlay.render(embed)
  None -> html.text("Not embeddable")
}
```

### One-step convenience

```gleam
case inlay.embed("https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8") {
  Some(element) -> element
  None -> html.text("Not embeddable")
}
```

### Pattern matching on Embed

The `Embed` type is a public tagged union. You can match on it for per-provider control:

```gleam
case inlay.detect(url) {
  Some(inlay.YoutubeVideo(id, ..)) -> custom_youtube_player(id)
  Some(inlay.SpotifyMedia(..) as embed) -> html.div([class("spotify-wrapper")], [inlay.render(embed)])
  Some(embed) -> inlay.render(embed)
  None -> html.a([attribute.href(url)], [html.text(url)])
}
```

### Lustre SPA

Build a utility function to use anywhere in your views:

```gleam
import gleam/list
import gleam/option.{None, Some}
import inlay
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn link_or_embed(url: String) -> Element(msg) {
  case inlay.detect(url) {
    Some(embed) -> inlay.render(embed)
    None -> html.a([attribute.href(url)], [html.text(url)])
  }
}

pub fn view_post_body(lines: List(String)) -> Element(msg) {
  html.div([], list.map(lines, fn(line) {
    case inlay.detect(line) {
      Some(embed) -> inlay.render(embed)
      None -> html.p([], [html.text(line)])
    }
  }))
}
```

### Server-side rendering

Lustre elements render to HTML strings for SSR:

```gleam
import lustre/element

case inlay.embed("https://vimeo.com/148751763") {
  Some(el) -> element.to_string(el)
  None -> "<p>Not embeddable</p>"
}
```

### Blogatto integration

Inlay integrates with [Blogatto](https://blogat.to/)'s markdown component system. Anchor tags pointing to embeddable URLs are replaced with embed elements at the AST level.

**Zero-config** (standard anchor fallback for non-embed links):

```gleam
import blogatto/config/markdown
import inlay

let md =
  markdown.default()
  |> markdown.markdown_path("./blog")
  |> markdown.a(inlay.a_component_default())
```

**With custom anchor handling** (e.g. external links open in a new tab):

```gleam
import gleam/option.{None, Some}
import gleam/string
import blogatto/config/markdown
import lustre/attribute
import lustre/element/html
import inlay

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

Embed URLs are replaced with the provider element; everything else passes through to your fallback.

## Configuration

All providers are enabled by default except **Twitch** (requires a `parent` domain) and **Mastodon** (requires a server allowlist).

### Disabling providers

```gleam
let config =
  inlay.default_config()
  |> inlay.no_twitter()
  |> inlay.no_tiktok()

case inlay.embed_with("https://x.com/user/status/123", config) {
  Some(_) -> // won't match — Twitter is disabled
  None -> // falls through
}
```

### Configuring providers

```gleam
import inlay
import inlay/embed.{MastodonConfig, TwitchConfig, YoutubeConfig}

let config =
  inlay.default_config()
  |> inlay.youtube(YoutubeConfig(no_cookie: False))
  |> inlay.twitch(TwitchConfig(parent: "mysite.com"))
  |> inlay.mastodon(MastodonConfig(servers: ["mastodon.social", "fosstodon.org"]))
```

### Provider config reference

| Provider | Config type | Fields | Default |
|----------|------------|--------|---------|
| YouTube | `YoutubeConfig` | `no_cookie: Bool` | `True` |
| Vimeo | `VimeoConfig` | `dnt: Bool` | `True` |
| Twitch | `TwitchConfig` | `parent: String` | disabled |
| Mastodon | `MastodonConfig` | `servers: List(String)` | disabled |
| Spotify | `SpotifyConfig` | — | enabled |
| Twitter/X | `TwitterConfig` | — | enabled |
| TikTok | `TikTokConfig` | — | enabled |
| Bluesky | `BlueskyConfig` | — | enabled |
| Instagram | `InstagramConfig` | — | enabled |
| OpenStreetMap | `OpenStreetMapConfig` | — | enabled |
| TED | `TedConfig` | — | enabled |
| SoundCloud | `SoundCloudConfig` | — | enabled |

## Supported providers

| Provider | Example URL |
|----------|------------|
| YouTube | `youtube.com/watch?v=ID`, `youtu.be/ID`, playlists |
| Vimeo | `vimeo.com/148751763` |
| Spotify | `open.spotify.com/track/ID`, albums, playlists, artists, episodes, shows |
| Twitter/X | `twitter.com/user/status/ID`, `x.com/user/status/ID` |
| TikTok | `tiktok.com/@user/video/ID` |
| Bluesky | `bsky.app/profile/handle/post/ID` |
| Instagram | `instagram.com/p/ID`, `/reel/ID`, `/tv/ID` |
| Twitch | `twitch.tv/channel`, `twitch.tv/videos/ID` |
| OpenStreetMap | `openstreetmap.org/...#map=zoom/lat/long` |
| TED | `ted.com/talks/slug` |
| SoundCloud | `soundcloud.com/artist/track` |
| Mastodon | `mastodon.social/@user/ID` (configured servers only) |

## Development

```sh
gleam test  # Run the tests
gleam build # Build for both Erlang and JavaScript targets
```

Further documentation can be found at <https://hexdocs.pm/inlay>.
