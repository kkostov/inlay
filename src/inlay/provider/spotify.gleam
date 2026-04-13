import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{
  type Config, type Embed, SpotifyAlbum, SpotifyArtist, SpotifyEpisode,
  SpotifyMedia, SpotifyPlaylist, SpotifyShow, SpotifyTrack,
}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("open.spotify.com") -> detect_spotify(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    SpotifyMedia(media_type, id) -> {
      let type_str = media_type_to_string(media_type)
      let src = "https://open.spotify.com/embed/" <> type_str <> "/" <> id
      let #(width, track_height, other_height) = case config.spotify {
        Some(embed.SpotifyConfig(w, h, th)) -> #(
          option.unwrap(w, 300),
          option.unwrap(th, 152),
          option.unwrap(h, 352),
        )
        None -> #(300, 152, 352)
      }
      let height = case media_type {
        SpotifyTrack -> track_height
        _ -> other_height
      }
      html.div(
        [
          attribute.styles([
            #("border-radius", "12px"),
            #("overflow", "hidden"),
          ]),
        ],
        [
          html.iframe([
            attribute.src(src),
            attribute.width(width),
            attribute.height(height),
            attribute.attribute("frameborder", "0"),
            attribute.attribute(
              "allow",
              "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
            ),
            attribute.attribute("loading", "lazy"),
          ]),
        ],
      )
    }
    _ -> panic as "unreachable"
  }
}

fn detect_spotify(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    ["track", id] -> validate_id(id, SpotifyTrack)
    ["album", id] -> validate_id(id, SpotifyAlbum)
    ["playlist", id] -> validate_id(id, SpotifyPlaylist)
    ["artist", id] -> validate_id(id, SpotifyArtist)
    ["episode", id] -> validate_id(id, SpotifyEpisode)
    ["show", id] -> validate_id(id, SpotifyShow)
    _ -> None
  }
}

fn validate_id(id: String, media_type: embed.SpotifyMediaType) -> Option(Embed) {
  case string.length(id) == 22 {
    True -> Some(SpotifyMedia(media_type, id))
    False -> None
  }
}

fn media_type_to_string(media_type: embed.SpotifyMediaType) -> String {
  case media_type {
    SpotifyTrack -> "track"
    SpotifyAlbum -> "album"
    SpotifyPlaylist -> "playlist"
    SpotifyArtist -> "artist"
    SpotifyEpisode -> "episode"
    SpotifyShow -> "show"
  }
}
