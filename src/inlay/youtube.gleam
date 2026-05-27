import gleam/int
import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, YoutubePlaylist, YoutubeVideo}
import inlay/iframe
import lustre/attribute
import lustre/element.{type Element}

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("youtube.com") | Some("www.youtube.com") | Some("m.youtube.com") ->
      detect_youtube(url)
    Some("youtu.be") | Some("www.youtu.be") -> detect_short(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  let domain = case config.youtube {
    Some(embed.YoutubeConfig(no_cookie: True, ..)) ->
      "https://www.youtube-nocookie.com"
    _ -> "https://www.youtube.com"
  }

  let src = case embed {
    YoutubeVideo(id, start_time, playlist) -> {
      let base = domain <> "/embed/" <> id
      let params = case start_time, playlist {
        Some(t), Some(p) -> "?start=" <> int.to_string(t) <> "&list=" <> p
        Some(t), None -> "?start=" <> int.to_string(t)
        None, Some(p) -> "?list=" <> p
        None, None -> ""
      }
      base <> params
    }
    YoutubePlaylist(id) -> domain <> "/embed/videoseries?list=" <> id
    _ -> panic as "unreachable"
  }

  let aspect_ratio = case config.youtube {
    Some(embed.YoutubeConfig(aspect_ratio: Some(r), ..)) -> r
    _ -> "56.25%"
  }

  iframe.responsive(src, aspect_ratio, [
    attribute.attribute("allowfullscreen", "true"),
    attribute.attribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
    ),
  ])
}

fn detect_youtube(url: Uri) -> Option(Embed) {
  let segments = uri.path_segments(url.path)
  let query_params = parse_query(url)

  case segments {
    ["watch"] -> detect_watch(query_params)
    ["playlist"] -> detect_playlist(query_params)
    ["embed", id] -> Some(YoutubeVideo(id, find_start(query_params), None))
    ["shorts", id] -> Some(YoutubeVideo(id, None, None))
    _ -> None
  }
}

fn detect_watch(params: List(#(String, String))) -> Option(Embed) {
  case find_param(params, "v") {
    Some(id) ->
      Some(YoutubeVideo(id, find_start(params), find_param(params, "list")))
    None -> None
  }
}

fn detect_playlist(params: List(#(String, String))) -> Option(Embed) {
  case find_param(params, "list") {
    Some(id) -> Some(YoutubePlaylist(id))
    None -> None
  }
}

fn detect_short(url: Uri) -> Option(Embed) {
  let params = parse_query(url)
  case uri.path_segments(url.path) {
    [id] if id != "" -> Some(YoutubeVideo(id, find_start(params), None))
    _ -> None
  }
}

fn find_start(params: List(#(String, String))) -> Option(Int) {
  case find_param(params, "t"), find_param(params, "start") {
    Some(t), _ -> parse_time(t)
    _, Some(s) -> parse_time(s)
    None, None -> None
  }
}

fn parse_time(value: String) -> Option(Int) {
  let cleaned = case string.ends_with(value, "s") {
    True -> string.drop_end(value, up_to: 1)
    False -> value
  }
  case int.parse(cleaned) {
    Ok(n) -> Some(n)
    Error(_) -> None
  }
}

fn parse_query(url: Uri) -> List(#(String, String)) {
  case url.query {
    Some(q) ->
      case uri.parse_query(q) {
        Ok(params) -> params
        Error(_) -> []
      }
    None -> []
  }
}

fn find_param(params: List(#(String, String)), key: String) -> Option(String) {
  case list.find(params, fn(pair) { pair.0 == key }) {
    Ok(#(_, value)) -> Some(value)
    Error(_) -> None
  }
}
