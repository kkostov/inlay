import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, TedTalk}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

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
      html.div(
        [
          attribute.styles([
            #("position", "relative"),
            #("padding-bottom", "56.25%"),
            #("height", "0"),
            #("overflow", "hidden"),
          ]),
        ],
        [
          html.iframe([
            attribute.src(src),
            attribute.styles([
              #("position", "absolute"),
              #("top", "0"),
              #("left", "0"),
              #("width", "100%"),
              #("height", "100%"),
            ]),
            attribute.attribute("frameborder", "0"),
            attribute.attribute("allowfullscreen", "true"),
            attribute.attribute(
              "allow",
              "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            ),
          ]),
        ],
      )
    }
    _ -> element.text("")
  }
}

fn detect_talk(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["talks", slug] -> Some(TedTalk(slug))
    _ -> None
  }
}
