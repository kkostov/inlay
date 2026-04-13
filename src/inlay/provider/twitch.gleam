import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, TwitchChannel, TwitchVideo}
import inlay/iframe
import lustre/attribute
import lustre/element.{type Element}

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("twitch.tv") | Some("www.twitch.tv") -> detect_twitch(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  let parent = case config.twitch {
    Some(embed.TwitchConfig(parent: p, ..)) -> p
    None -> "localhost"
  }

  let src = case embed {
    TwitchChannel(name) ->
      "https://player.twitch.tv/?channel=" <> name <> "&parent=" <> parent
    TwitchVideo(id) ->
      "https://player.twitch.tv/?video=" <> id <> "&parent=" <> parent
    _ -> panic as "unreachable"
  }

  let aspect_ratio = case config.twitch {
    Some(embed.TwitchConfig(aspect_ratio: Some(r), ..)) -> r
    _ -> "56.25%"
  }

  iframe.responsive(src, aspect_ratio, [
    attribute.attribute("allowfullscreen", "true"),
  ])
}

fn detect_twitch(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["videos", id] -> Some(TwitchVideo(id))
    [name] -> Some(TwitchChannel(name))
    _ -> None
  }
}
