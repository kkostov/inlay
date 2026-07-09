# inlay

[![Package Version](https://img.shields.io/hexpm/v/inlay)](https://hex.pm/packages/inlay)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/inlay/)


Inlay is a library which renders embedded previews for social links (Mastodon, Pixelfed, Apple Music, Bluesky, Spotify, etc..) as part of ([Blogatto](https://blogat.to/)) content or [Lustre](https://hexdocs.pm/lustre/) views.

There is a [demo website](https://inlay.statichost.page) where you can preview some of the integrations.

## Supported providers

Mastodon, Pixelfed, Apple Music, Bluesky, Spotify, Instagram, OpenStreetMap, SoundCloud, TED, TikTok, Twitch, Twitter/X, Vimeo, and YouTube

## Installation

```sh
gleam add inlay
```

## Components

In a Lustre application, you can use the `<inlay-embed url="…">` component to embed a url. Inlay will try to detect the provider from the URL and renders the embed


1. Configure inlay (see below for more configuration options).

```gleam
import inlay

pub fn main() {
  let config =
    inlay.default_config()
    |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))

  let assert Ok(_) = inlay.configure(config)
}
```


2. Use the `inlay-embed` component with an embed url:


```html
<inlay-embed url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></inlay-embed>
<inlay-embed url="https://mastodon.social/@iamkonstantin/116391354521208947"></inlay-embed>
<inlay-embed url="https://bsky.app/profile/did:plc:bwm3ipmp7fidz67iy4atioa5/post/3max7rufmvp2y"></inlay-embed>
```

`configure` takes a [`Config`](#configuration) which lets you setup if and how embeds appear for each platform. `inlay.register()` is shorthand for `configure(default_config())`.


A few rendering options can be tuned per embed with optional attributes: `no-cookie` (YouTube), `parent` (Twitch), `aspect-ratio`, etc:

```html
<inlay-embed url="https://www.twitch.tv/somechannel" parent="mysite.com"></inlay-embed>
```

Inside a Lustre view, use the helper instead of a raw tag:

```gleam
import inlay
import lustre/attribute

inlay.embed_element([
  attribute.attribute("url", "https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
])
```

> The `<inlay-embed>` component runs in the browser. To embed links in server-rendered HTML (like [Blogatto](#blogatto)), use the functions below instead.

## Configuration

Inlay only embeds URLs whose provider you've enabled - everything else passes through as a plain link.


- `inlay.new()` - all providers are disabled by default. You have to ppt in to the providers you want.

- `inlay.default_config()` - I picked some defaults that are enabled. You can still opt in and out of others.

> **Note:** When a URL's provider isn't enabled (or the URL isn't an embeddable one), Inlay returns `None` from `detect`, `embed`, and `embed_with`. See the [Lustre](#lustre) examples for inline rendering, or [`a_component(fallback)`](#a_componentfallback) for the Blogatto handler.

### Opt-in with `new()`

This is the recommended approach to avoid unexpected embeddings with links on your website.

```gleam
let config =
  inlay.new()
  |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))

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
  |> inlay.youtube(inlay.youtube_config() |> inlay.youtube_no_cookie(False))
  |> inlay.twitch(inlay.twitch_config("mysite.com"))
  |> inlay.mastodon(inlay.mastodon_config(["mastodon.social", "fosstodon.org"]))
```

### Bluesky

Bluesky embeds need an AT Protocol URI (`at://did:plc:.../app.bsky.feed.post/...`) to render the rich embed widget. When the post URL already contains a DID handle (e.g. `did:plc:z72i7hdynmk6r22z27h6tvur`), the embed works out of the box with the default config.

For human-readable handles (e.g. `alice.bsky.social`) or custom domains (e.g. `flowvi.be`), the handle has to be looked up first. The `<inlay-embed>` component does this for you automatically.

When you render with the functions instead (for example for static Blogatto pages), provide a `resolve_handle` function that turns the handle into a DID:

```gleam
import gleam/dynamic/decode
import gleam/httpc
import gleam/http/request
import gleam/json
import gleam/result
import inlay

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
  |> inlay.bluesky(inlay.bluesky_config() |> inlay.bluesky_resolver(resolve))
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

[Blogatto](https://blogat.to/)'s markdown renderer lets you replace how specific HTML tags are produced. Inlay provides a custom `<a>` tag handler - when the href points to an embeddable URL, the link is replaced with an embedded preview. Non-embeddable links pass through to a fallback function. You can intercept and further customize this behavior if needed.

Default handler with standard anchor fallback:

```gleam
let md =
  markdown.default()
  |> markdown.markdown_path("./blog")
  |> markdown.a(inlay.a_component_default())
```


If Inlay doesn't render an embed (e.g. if the link is not an enabled social link or not an embed), you can control what happens to the link with a custom fallback component:


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


You can also do this inline with a callback:

```gleam
let md =
  markdown.default()
  |> markdown.markdown_path("./blog")
  |> markdown.a(
        inlay.a_component_with(embed_config, fn(_attrs, href, title, children) {
          let attrs = [attribute.href(href)]
          let attrs = case title {
            option.Some(t) -> [attribute.title(t), ..attrs]
            option.None -> attrs
          }
          html.a(attrs, children)
        }),
      )
```

## Development

```sh
gleam test  # Run the tests
gleam build # Build for both Erlang and JavaScript targets
```

Further documentation can be found at <https://hexdocs.pm/inlay>.
