import gleam/dynamic/decode
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, BlueskyConfig, BlueskyPost}
import lustre/attribute
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import rsvp

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("bsky.app") -> detect_bluesky(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Result(Element(msg), Nil) {
  case embed {
    BlueskyPost(handle, rkey) ->
      case resolve_handle(handle, config) {
        Ok(did) -> Ok(resolved_view(handle, did, rkey))
        Error(_) -> Ok(fallback_view(handle, rkey))
      }
    _ -> Error(Nil)
  }
}

/// Render the rich Bluesky embed for a post whose handle has been resolved to a
/// DID. Includes the `embed.js` script that hydrates the blockquote.
pub fn resolved_view(
  handle: String,
  did: String,
  rkey: String,
) -> Element(msg) {
  let post_url = post_url(handle, rkey)
  let at_uri = "at://" <> did <> "/app.bsky.feed.post/" <> rkey
  html.div([], [
    html.blockquote(
      [
        attribute.class("bluesky-embed"),
        attribute.attribute("data-bluesky-uri", at_uri),
      ],
      [html.a([attribute.href(post_url)], [element.text(post_url)])],
    ),
    html.script(
      [
        attribute.src("https://embed.bsky.app/static/embed.js"),
        attribute.attribute("async", "true"),
        attribute.attribute("charset", "utf-8"),
      ],
      "",
    ),
  ])
}

/// Render a plain link to a Bluesky post, used when the handle cannot be
/// resolved to a DID.
pub fn fallback_view(handle: String, rkey: String) -> Element(msg) {
  let post_url = post_url(handle, rkey)
  html.div([], [
    html.blockquote([attribute.class("bluesky-embed")], [
      html.a([attribute.href(post_url)], [element.text(post_url)]),
    ]),
  ])
}

/// Whether a Bluesky handle needs a network round-trip to resolve to a DID. A
/// handle already in `did:` form renders synchronously and needs no resolution.
pub fn needs_resolution(handle: String) -> Bool {
  !string.starts_with(handle, "did:")
}

/// Resolve a Bluesky handle to a DID over the network, turning the result into a
/// message with `to_msg`. Cross-target: uses `fetch` on JavaScript and `httpc`
/// on Erlang.
pub fn resolve_effect(
  handle: String,
  to_msg: fn(Result(String, rsvp.Error(String))) -> msg,
) -> Effect(msg) {
  let url =
    "https://bsky.social/xrpc/com.atproto.identity.resolveHandle?handle="
    <> handle
  rsvp.get(url, rsvp.expect_json(did_decoder(), to_msg))
}

/// Decode the `did` field from a Bluesky `resolveHandle` response.
pub fn did_decoder() -> decode.Decoder(String) {
  use did <- decode.field("did", decode.string)
  decode.success(did)
}

fn post_url(handle: String, rkey: String) -> String {
  "https://bsky.app/profile/" <> handle <> "/post/" <> rkey
}

fn resolve_handle(handle: String, config: Config) -> Result(String, Nil) {
  case string.starts_with(handle, "did:") {
    True -> Ok(handle)
    False ->
      case config.bluesky {
        Some(BlueskyConfig(resolve_handle: Some(resolver))) -> resolver(handle)
        _ -> Error(Nil)
      }
  }
}

fn detect_bluesky(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["profile", handle, "post", rkey] -> Some(BlueskyPost(handle, rkey))
    _ -> None
  }
}
