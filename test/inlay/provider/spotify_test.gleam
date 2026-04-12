import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{
  SpotifyAlbum, SpotifyArtist, SpotifyEpisode, SpotifyMedia, SpotifyPlaylist,
  SpotifyShow, SpotifyTrack,
}
import inlay/provider/spotify
import lustre/element

pub fn track_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6")
  let assert Some(SpotifyMedia(SpotifyTrack, "6rqhFgbbKwnb9MLmUQDhG6")) =
    spotify.detect(url)
}

pub fn album_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/album/1DFixLWuPkv3KT3TnV35m3")
  let assert Some(SpotifyMedia(SpotifyAlbum, "1DFixLWuPkv3KT3TnV35m3")) =
    spotify.detect(url)
}

pub fn playlist_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M")
  let assert Some(SpotifyMedia(SpotifyPlaylist, "37i9dQZF1DXcBWIGoYBM5M")) =
    spotify.detect(url)
}

pub fn artist_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF")
  let assert Some(SpotifyMedia(SpotifyArtist, "0OdUWJ0sBjDrqHygGUXeCF")) =
    spotify.detect(url)
}

pub fn episode_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/episode/0lbVfT8xldBs1LHJZ1rVb1")
  let assert Some(SpotifyMedia(SpotifyEpisode, "0lbVfT8xldBs1LHJZ1rVb1")) =
    spotify.detect(url)
}

pub fn show_url_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL")
  let assert Some(SpotifyMedia(SpotifyShow, "2MAi0BvDc6GTFvKFPXnkCL")) =
    spotify.detect(url)
}

pub fn invalid_id_length_returns_none_test() {
  let assert Ok(url) = uri.parse("https://open.spotify.com/track/short")
  let assert None = spotify.detect(url)
}

pub fn unknown_type_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/unknown/6rqhFgbbKwnb9MLmUQDhG6")
  let assert None = spotify.detect(url)
}

pub fn non_spotify_url_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://example.com/track/6rqhFgbbKwnb9MLmUQDhG6")
  let assert None = spotify.detect(url)
}

pub fn render_track_test() {
  let e = SpotifyMedia(SpotifyTrack, "6rqhFgbbKwnb9MLmUQDhG6")
  let html = element.to_string(spotify.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "open.spotify.com/embed/track/6rqhFgbbKwnb9MLmUQDhG6")
  let assert True = string.contains(html, "height=\"152\"")
}

pub fn render_album_test() {
  let e = SpotifyMedia(SpotifyAlbum, "1DFixLWuPkv3KT3TnV35m3")
  let html = element.to_string(spotify.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3")
  let assert True = string.contains(html, "height=\"352\"")
}
