import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, MastodonPost}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri, config: Config) -> Option(Embed) {
  case config.mastodon {
    Some(embed.MastodonConfig(servers: servers)) ->
      case url.host {
        Some(host) ->
          case list.contains(servers, host) {
            True -> detect_mastodon(host, url)
            False -> None
          }
        None -> None
      }
    None -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    MastodonPost(server, user, id) -> {
      let src = "https://" <> server <> "/@" <> user <> "/" <> id <> "/embed"
      html.div([], [
        html.iframe([
          attribute.src(src),
          attribute.width(400),
          attribute.height(400),
          attribute.attribute("frameborder", "0"),
          attribute.attribute("allowfullscreen", "true"),
          attribute.attribute("loading", "lazy"),
        ]),
      ])
    }
    _ -> element.text("")
  }
}

fn detect_mastodon(server: String, url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [user_with_at, id] ->
      case string.starts_with(user_with_at, "@") {
        True -> {
          let user = string.drop_start(user_with_at, up_to: 1)
          Some(MastodonPost(server, user, id))
        }
        False -> None
      }
    _ -> None
  }
}
