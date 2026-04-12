import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, TikTokVideo}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("tiktok.com") | Some("www.tiktok.com") -> detect_tiktok(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    TikTokVideo(username, id) -> {
      let cite_url = "https://www.tiktok.com/" <> username <> "/video/" <> id
      html.div([], [
        html.blockquote(
          [
            attribute.class("tiktok-embed"),
            attribute.attribute("cite", cite_url),
            attribute.attribute("data-video-id", id),
          ],
          [
            html.a([attribute.href(cite_url)], [element.text(cite_url)]),
          ],
        ),
        html.script(
          [
            attribute.src("https://www.tiktok.com/embed.js"),
            attribute.attribute("async", "true"),
          ],
          "",
        ),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_tiktok(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [username, "video", id] -> Some(TikTokVideo(username, id))
    _ -> None
  }
}
