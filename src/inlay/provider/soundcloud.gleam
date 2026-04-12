import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, SoundCloudTrack}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("soundcloud.com") | Some("www.soundcloud.com") ->
      detect_soundcloud(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    SoundCloudTrack(path) -> {
      let encoded_url = uri.percent_encode("https://soundcloud.com" <> path)
      let src = "https://w.soundcloud.com/player/?url=" <> encoded_url
      html.div([], [
        html.iframe([
          attribute.src(src),
          attribute.width(300),
          attribute.height(166),
          attribute.attribute("frameborder", "0"),
          attribute.attribute("allow", "autoplay"),
          attribute.attribute("loading", "lazy"),
        ]),
      ])
    }
    _ -> element.text("")
  }
}

fn detect_soundcloud(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [_user, _track] -> Some(SoundCloudTrack(url.path))
    [_user, "sets", _set] -> Some(SoundCloudTrack(url.path))
    _ -> None
  }
}
