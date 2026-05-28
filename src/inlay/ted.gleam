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

pub fn render(embed: Embed, config: Config) -> Result(Element(msg), Nil) {
  case embed {
    TedTalk(slug) -> {
      let src = "https://embed.ted.com/talks/" <> slug
      let aspect_ratio = case config.ted {
        Some(embed.TedConfig(aspect_ratio: Some(r))) -> r
        _ -> "56.25%"
      }
      Ok(
        iframe.responsive(src, aspect_ratio, [
          attribute.attribute("allowfullscreen", "true"),
          attribute.attribute(
            "allow",
            "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
          ),
        ]),
      )
    }
    _ -> Error(Nil)
  }
}

fn detect_talk(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["talks", slug] -> Some(TedTalk(slug))
    _ -> None
  }
}
