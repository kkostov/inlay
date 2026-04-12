import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, TedTalk}
import inlay/iframe
import lustre/attribute
import lustre/element.{type Element}

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("www.ted.com") | Some("ted.com") -> detect_talk(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    TedTalk(slug) -> {
      let src = "https://embed.ted.com/talks/" <> slug
      iframe.responsive(src, "56.25%", [
        attribute.attribute("allowfullscreen", "true"),
        attribute.attribute(
          "allow",
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        ),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_talk(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["talks", slug] -> Some(TedTalk(slug))
    _ -> None
  }
}
