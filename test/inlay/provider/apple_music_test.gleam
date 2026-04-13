import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{
  AppleMusicAlbum, AppleMusicArtist, AppleMusicMedia, AppleMusicMusicVideo,
  AppleMusicPlaylist, AppleMusicSong,
}
import inlay/provider/apple_music
import lustre/element

pub fn artist_url_test() {
  let assert Ok(url) =
    uri.parse("https://music.apple.com/be/artist/evanescence/42102393")
  let assert Some(AppleMusicMedia(AppleMusicArtist, "be", "evanescence", "42102393")) =
    apple_music.detect(url)
}

pub fn album_url_test() {
  let assert Ok(url) =
    uri.parse("https://music.apple.com/be/album/bleed-out/1699386566")
  let assert Some(AppleMusicMedia(AppleMusicAlbum, "be", "bleed-out", "1699386566")) =
    apple_music.detect(url)
}

pub fn playlist_url_test() {
  let assert Ok(url) =
    uri.parse(
      "https://music.apple.com/be/playlist/ramin-djawadi-essentials/pl.ac83e6e212d5400198f4c8c2110a2af1",
    )
  let assert Some(AppleMusicMedia(
    AppleMusicPlaylist,
    "be",
    "ramin-djawadi-essentials",
    "pl.ac83e6e212d5400198f4c8c2110a2af1",
  )) = apple_music.detect(url)
}

pub fn song_url_test() {
  let assert Ok(url) =
    uri.parse(
      "https://music.apple.com/us/album/bring-me-to-life/1451078854?i=1451078855",
    )
  let assert Some(AppleMusicMedia(
    AppleMusicSong("1451078855"),
    "us",
    "bring-me-to-life",
    "1451078854",
  )) = apple_music.detect(url)
}

pub fn music_video_url_test() {
  let assert Ok(url) =
    uri.parse(
      "https://music.apple.com/us/music-video/going-under/1440833272",
    )
  let assert Some(AppleMusicMedia(
    AppleMusicMusicVideo,
    "us",
    "going-under",
    "1440833272",
  )) = apple_music.detect(url)
}

pub fn wrong_host_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://open.spotify.com/track/abc")
  let assert None = apple_music.detect(url)
}

pub fn missing_segments_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://music.apple.com/us")
  let assert None = apple_music.detect(url)
}

pub fn invalid_path_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://music.apple.com/us/unknown/foo/123")
  let assert None = apple_music.detect(url)
}

pub fn render_song_test() {
  let e =
    AppleMusicMedia(
      AppleMusicSong("1451078855"),
      "us",
      "bring-me-to-life",
      "1451078854",
    )
  let html = element.to_string(apple_music.render(e, embed.default_config()))
  let assert True = string.contains(html, "embed.music.apple.com")
  let assert True = string.contains(html, "height=\"175\"")
  let assert True = string.contains(html, "?i=1451078855")
}

pub fn render_album_test() {
  let e = AppleMusicMedia(AppleMusicAlbum, "be", "bleed-out", "1699386566")
  let html = element.to_string(apple_music.render(e, embed.default_config()))
  let assert True = string.contains(html, "embed.music.apple.com")
  let assert True = string.contains(html, "height=\"450\"")
}

pub fn render_artist_test() {
  let e =
    AppleMusicMedia(AppleMusicArtist, "be", "evanescence", "42102393")
  let html = element.to_string(apple_music.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "embed.music.apple.com/be/artist/evanescence/42102393")
}
