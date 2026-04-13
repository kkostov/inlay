import gleam/list
import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{
  type Config, type Embed, AppleMusicAlbum, AppleMusicArtist, AppleMusicMedia,
  AppleMusicMusicVideo, AppleMusicPlaylist, AppleMusicSong,
}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("music.apple.com") -> detect_apple_music(url)
    _ -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    AppleMusicMedia(media_type, country, slug, id) -> {
      let type_path = media_type_to_path(media_type)
      let base =
        "https://embed.music.apple.com/"
        <> country
        <> "/"
        <> type_path
        <> "/"
        <> slug
        <> "/"
        <> id
      let src = case media_type {
        AppleMusicSong(track_id) -> base <> "?i=" <> track_id
        AppleMusicAlbum -> base
        AppleMusicArtist -> base
        AppleMusicPlaylist -> base
        AppleMusicMusicVideo -> base
      }
      let height = case media_type, config.apple_music {
        AppleMusicSong(_),
          Some(embed.AppleMusicConfig(song_height: Some(h), ..))
        -> h
        AppleMusicSong(_), _ -> 175
        AppleMusicAlbum, Some(embed.AppleMusicConfig(height: Some(h), ..)) -> h
        AppleMusicArtist, Some(embed.AppleMusicConfig(height: Some(h), ..)) -> h
        AppleMusicPlaylist, Some(embed.AppleMusicConfig(height: Some(h), ..)) ->
          h
        AppleMusicMusicVideo, Some(embed.AppleMusicConfig(height: Some(h), ..)) ->
          h
        _, _ -> 450
      }
      html.iframe([
        attribute.src(src),
        attribute.height(height),
        attribute.attribute(
          "allow",
          "autoplay *; encrypted-media *; fullscreen *; clipboard-write",
        ),
        attribute.attribute(
          "sandbox",
          "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation",
        ),
        attribute.styles([
          #("width", "100%"),
          #("max-width", "660px"),
          #("overflow", "hidden"),
          #("border-radius", "10px"),
          #("border", "0"),
        ]),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_apple_music(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [country, "album", slug, id] ->
      case find_track_id(url) {
        Some(track_id) ->
          Some(AppleMusicMedia(AppleMusicSong(track_id), country, slug, id))
        None -> Some(AppleMusicMedia(AppleMusicAlbum, country, slug, id))
      }
    [country, "artist", slug, id] ->
      Some(AppleMusicMedia(AppleMusicArtist, country, slug, id))
    [country, "playlist", slug, id] ->
      Some(AppleMusicMedia(AppleMusicPlaylist, country, slug, id))
    [country, "music-video", slug, id] ->
      Some(AppleMusicMedia(AppleMusicMusicVideo, country, slug, id))
    _ -> None
  }
}

fn find_track_id(url: Uri) -> Option(String) {
  case url.query {
    Some(q) ->
      case uri.parse_query(q) {
        Ok(params) ->
          case list.find(params, fn(pair) { pair.0 == "i" }) {
            Ok(#(_, value)) -> Some(value)
            Error(_) -> None
          }
        Error(_) -> None
      }
    None -> None
  }
}

fn media_type_to_path(media_type: embed.AppleMusicMediaType) -> String {
  case media_type {
    AppleMusicAlbum -> "album"
    AppleMusicArtist -> "artist"
    AppleMusicPlaylist -> "playlist"
    AppleMusicSong(_) -> "album"
    AppleMusicMusicVideo -> "music-video"
  }
}
