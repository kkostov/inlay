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

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    SpotifyMedia(media_type, id) -> {
      let type_str = media_type_to_string(media_type)
      let src = "https://open.spotify.com/embed/" <> type_str <> "/" <> id
      let height = case media_type {
        SpotifyTrack -> 152
        _ -> 352
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
            attribute.width(300),
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
    _ -> element.text("")
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
