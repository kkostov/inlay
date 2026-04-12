import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, PixelfedPost}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri, config: Config) -> Option(Embed) {
  case config.pixelfed {
    Some(embed.PixelfedConfig(servers: servers, ..)) ->
      case url.host {
        Some(host) ->
          case list.contains(servers, host) {
            True -> detect_pixelfed(host, url)
            False -> None
          }
        None -> None
      }
    None -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    PixelfedPost(server, user, id) -> {
      let #(caption, likes, layout) = case config.pixelfed {
        Some(embed.PixelfedConfig(caption: c, likes: l, layout: ly, ..)) -> #(
          c,
          l,
          ly,
        )
        None -> #(True, True, embed.Full)
      }
      let caption_str = bool_to_string(caption)
      let likes_str = bool_to_string(likes)
      let layout_str = layout_to_string(layout)
      let src =
        "https://"
        <> server
        <> "/p/"
        <> user
        <> "/"
        <> id
        <> "/embed?caption="
        <> caption_str
        <> "&likes="
        <> likes_str
        <> "&layout="
        <> layout_str
      html.div([], [
        html.iframe([
          attribute.attribute("title", "Pixelfed Post Embed"),
          attribute.src(src),
          attribute.class("pixelfed__embed"),
          attribute.styles([#("max-width", "100%"), #("border", "0")]),
          attribute.width(400),
          attribute.attribute("allowfullscreen", "allowfullscreen"),
        ]),
        html.script(
          [
            attribute.src("https://" <> server <> "/embed.js"),
            attribute.attribute("async", "true"),
            attribute.attribute("defer", "true"),
          ],
          "",
        ),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_pixelfed(server: String, url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["p", user, id] -> Some(PixelfedPost(server, user, id))
    _ -> None
  }
}

fn bool_to_string(value: Bool) -> String {
  case value {
    True -> "true"
    False -> "false"
  }
}

fn layout_to_string(layout: embed.PixelfedLayout) -> String {
  case layout {
    embed.Full -> "full"
    embed.Compact -> "compact"
  }
}
