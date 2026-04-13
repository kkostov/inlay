import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, BlueskyConfig, BlueskyPost}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("bsky.app") -> detect_bluesky(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    BlueskyPost(handle, rkey) -> {
      let post_url =
        "https://bsky.app/profile/" <> handle <> "/post/" <> rkey
      case resolve_handle(handle, config) {
        Ok(did) -> {
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
        Error(_) -> {
          html.div([], [
            html.blockquote(
              [attribute.class("bluesky-embed")],
              [html.a([attribute.href(post_url)], [element.text(post_url)])],
            ),
          ])
        }
      }
    }
    _ -> panic as "unreachable"
  }
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
