import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{SoundCloudTrack}
import inlay/provider/soundcloud
import lustre/element

pub fn track_url_test() {
  let assert Ok(url) =
    uri.parse("https://soundcloud.com/artist-name/track-name")
  let assert Some(SoundCloudTrack("/artist-name/track-name")) =
    soundcloud.detect(url)
}

pub fn set_url_test() {
  let assert Ok(url) =
    uri.parse("https://soundcloud.com/artist-name/sets/album-name")
  let assert Some(SoundCloudTrack("/artist-name/sets/album-name")) =
    soundcloud.detect(url)
}

pub fn profile_only_returns_none_test() {
  let assert Ok(url) = uri.parse("https://soundcloud.com/artist-name")
  let assert None = soundcloud.detect(url)
}

pub fn non_soundcloud_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/artist-name/track-name")
  let assert None = soundcloud.detect(url)
}

pub fn render_soundcloud_test() {
  let e = SoundCloudTrack("/artist-name/track-name")
  let html = element.to_string(soundcloud.render(e, embed.default_config()))
  let assert True = string.contains(html, "w.soundcloud.com/player/")
  let assert True = string.contains(html, "soundcloud.com")
}
