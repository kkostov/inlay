//// Self-contained iframe rendering for the `<inlay-embed>` Lustre component.
////
//// A Lustre component always renders into a shadow root. Several providers ship
//// a placeholder plus a host-page script that scans the document with
//// `querySelectorAll` to hydrate or resize the embed, and that scan cannot
//// reach inside a shadow root. For those providers this module renders the
//// embed as a self-contained `<iframe>` that points at the provider's own embed
//// page, which needs no host-page script and works inside the shadow root.
////
//// The static (`inlay.render`) path keeps using the script-based embeds, which
//// work in plain light-DOM HTML

import gleam/int
import inlay/embed.{Post, Reel, TV}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// Marks an iframe whose height is refined by a provider resize message. The
/// component's FFI listens for those messages on the shadow root and resizes
/// the matching iframe.
pub const resize_class = "inlay-embed-frame"

/// Render a Bluesky post as a self-contained embed iframe for a resolved DID.
pub fn bluesky_iframe(did: String, rkey: String, height: Int) -> Element(msg) {
  let src =
    "https://embed.bsky.app/embed/" <> did <> "/app.bsky.feed.post/" <> rkey
  frame(src, "Bluesky post", height)
}

/// Render a Tweet as a self-contained embed iframe.
pub fn tweet_iframe(id: String, height: Int) -> Element(msg) {
  let src = "https://platform.twitter.com/embed/Tweet.html?id=" <> id
  frame(src, "Tweet", height)
}

/// Render an Instagram post as a self-contained embed iframe.
pub fn instagram_iframe(
  post_type: embed.InstagramPostType,
  id: String,
  height: Int,
) -> Element(msg) {
  let type_segment = case post_type {
    Post -> "p"
    Reel -> "reel"
    TV -> "tv"
  }
  let src =
    "https://www.instagram.com/" <> type_segment <> "/" <> id <> "/embed/"
  frame(src, "Instagram post", height)
}

/// Render a TikTok video as a self-contained embed iframe.
pub fn tiktok_iframe(id: String, height: Int) -> Element(msg) {
  let src = "https://www.tiktok.com/embed/v2/" <> id
  frame(src, "TikTok video", height)
}

/// Render a Mastodon post as a self-contained embed iframe.
pub fn mastodon_iframe(
  server: String,
  user: String,
  id: String,
  height: Int,
) -> Element(msg) {
  let src = "https://" <> server <> "/@" <> user <> "/" <> id <> "/embed"
  frame(src, "Mastodon post", height)
}

/// Render a Pixelfed post as a self-contained embed iframe.
pub fn pixelfed_iframe(
  server: String,
  user: String,
  id: String,
  height: Int,
) -> Element(msg) {
  let src = "https://" <> server <> "/p/" <> user <> "/" <> id <> "/embed"
  frame(src, "Pixelfed post", height)
}

fn frame(src: String, title: String, height: Int) -> Element(msg) {
  html.iframe([
    attribute.attribute("title", title),
    attribute.src(src),
    attribute.class(resize_class),
    attribute.styles([
      #("width", "100%"),
      #("border", "0"),
      #("height", int.to_string(height) <> "px"),
    ]),
    attribute.attribute("scrolling", "no"),
    attribute.attribute("allowfullscreen", "true"),
    attribute.attribute("loading", "lazy"),
    attribute.attribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation",
    ),
  ])
}
