import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, BlueskyPost}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("bsky.app") -> detect_bluesky(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    BlueskyPost(handle, rkey) -> {
      let src = "https://embed.bsky.app/embed/" <> handle <> "/app.bsky.feed.post/" <> rkey
      html.div([], [
        html.iframe([
          attribute.src(src),
          attribute.width(600),
          attribute.height(400),
          attribute.attribute("frameborder", "0"),
          attribute.attribute("loading", "lazy"),
        ]),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_bluesky(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["profile", handle, "post", rkey] -> Some(BlueskyPost(handle, rkey))
    _ -> None
  }
}
