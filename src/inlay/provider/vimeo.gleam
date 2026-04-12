import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, VimeoVideo}
import inlay/iframe
import lustre/attribute
import lustre/element.{type Element}

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("vimeo.com") | Some("www.vimeo.com") -> detect_vimeo(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    VimeoVideo(id, privacy_hash) -> {
      let base = "https://player.vimeo.com/video/" <> id
      let dnt = case config.vimeo {
        Some(embed.VimeoConfig(dnt: True)) -> True
        _ -> False
      }
      let params = case dnt, privacy_hash {
        True, Some(h) -> "?dnt=1&h=" <> h
        True, None -> "?dnt=1"
        False, Some(h) -> "?h=" <> h
        False, None -> ""
      }
      let src = base <> params
      iframe.responsive(src, "56.25%", [
        attribute.attribute("allowfullscreen", "true"),
        attribute.attribute("allow", "autoplay; fullscreen; picture-in-picture"),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_vimeo(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [id] -> Some(VimeoVideo(id, None))
    [id, hash] -> Some(VimeoVideo(id, Some(hash)))
    _ -> None
  }
}
