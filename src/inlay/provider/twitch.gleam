import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, TwitchChannel, TwitchVideo}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("twitch.tv") | Some("www.twitch.tv") -> detect_twitch(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  let parent = case config.twitch {
    Some(embed.TwitchConfig(parent: p)) -> p
    None -> "localhost"
  }

  let src = case embed {
    TwitchChannel(name) ->
      "https://player.twitch.tv/?channel=" <> name <> "&parent=" <> parent
    TwitchVideo(id) ->
      "https://player.twitch.tv/?video=" <> id <> "&parent=" <> parent
    _ -> ""
  }

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
      ]),
    ],
  )
}

fn detect_twitch(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["videos", id] -> Some(TwitchVideo(id))
    [name] -> Some(TwitchChannel(name))
    _ -> None
  }
}
