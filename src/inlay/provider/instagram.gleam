import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, InstagramPost, Post, Reel, TV}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("instagram.com") | Some("www.instagram.com") -> detect_instagram(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    InstagramPost(post_type, id) -> {
      let type_segment = case post_type {
        Post -> "p"
        Reel -> "reel"
        TV -> "tv"
      }
      let permalink =
        "https://www.instagram.com/" <> type_segment <> "/" <> id <> "/"
      html.div([], [
        html.blockquote(
          [
            attribute.class("instagram-media"),
            attribute.attribute("data-instgrm-permalink", permalink),
          ],
          [
            html.a([attribute.href(permalink)], [element.text(permalink)]),
          ],
        ),
        html.script(
          [
            attribute.src("https://www.instagram.com/embed.js"),
            attribute.attribute("async", "true"),
          ],
          "",
        ),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_instagram(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["p", id] -> Some(InstagramPost(Post, id))
    ["p", id, ""] -> Some(InstagramPost(Post, id))
    ["reel", id] -> Some(InstagramPost(Reel, id))
    ["reel", id, ""] -> Some(InstagramPost(Reel, id))
    ["tv", id] -> Some(InstagramPost(TV, id))
    ["tv", id, ""] -> Some(InstagramPost(TV, id))
    _ -> None
  }
}
