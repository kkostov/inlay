import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, MastodonPost}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri, config: embed.MastodonConfig) -> Option(Embed) {
  case url.host {
    Some(host) ->
      case list.contains(config.servers, host) {
        True -> detect_mastodon(host, url)
        False -> None
      }
    None -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Result(Element(msg), Nil) {
  case embed {
    MastodonPost(server, user, id) -> {
      let width = case config.mastodon {
        Some(embed.MastodonConfig(width: w, ..)) -> option.unwrap(w, 400)
        None -> 400
      }
      let src = "https://" <> server <> "/@" <> user <> "/" <> id <> "/embed"
      Ok(
        html.div([], [
          html.iframe([
            attribute.src(src),
            attribute.class("mastodon-embed"),
            attribute.styles([#("max-width", "100%"), #("border", "0")]),
            attribute.width(width),
            attribute.attribute("allowfullscreen", "true"),
            attribute.attribute("loading", "lazy"),
            attribute.attribute(
              "sandbox",
              "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox",
            ),
          ]),
          html.script(
            [
              attribute.src("https://" <> server <> "/embed.js"),
              attribute.attribute("async", "true"),
              attribute.attribute("defer", "true"),
            ],
            "",
          ),
        ]),
      )
    }
    _ -> Error(Nil)
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
