import gleam/option.{None, Some}
import gleam/string
import gleeunit
import inlay
import inlay/embed.{
  BlueskyPost, Full, MastodonPost, PixelfedPost, SpotifyMedia, SpotifyTrack,
  TedTalk, YoutubeConfig, YoutubePlaylist, YoutubeVideo,
}
import lustre/element

pub fn main() -> Nil {
  gleeunit.main()
}

pub fn detect_youtube_video_test() {
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) =
    inlay.detect("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
}

pub fn detect_youtube_playlist_test() {
  let assert Some(YoutubePlaylist("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf")) =
    inlay.detect(
      "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    )
}

pub fn detect_spotify_test() {
  let assert Some(SpotifyMedia(SpotifyTrack, "6rqhFgbbKwnb9MLmUQDhG6")) =
    inlay.detect("https://open.spotify.com/track/6rqhFgbbKwnb9MLmUQDhG6")
}

pub fn detect_bluesky_test() {
  let assert Some(BlueskyPost("jay.bsky.social", "3jt5dwi5gzc2x")) =
    inlay.detect("https://bsky.app/profile/jay.bsky.social/post/3jt5dwi5gzc2x")
}

pub fn detect_ted_test() {
  let assert Some(TedTalk("simon_sinek_how_great_leaders_inspire_action")) =
    inlay.detect(
      "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
    )
}

pub fn detect_unknown_url_returns_none_test() {
  let assert None = inlay.detect("https://www.example.com/page")
}

pub fn detect_invalid_url_returns_none_test() {
  let assert None = inlay.detect("not a url at all")
}

pub fn embed_youtube_produces_html_test() {
  let assert Some(el) =
    inlay.embed("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  let html = element.to_string(el)
  let assert True =
    string.contains(html, "youtube-nocookie.com/embed/dQw4w9WgXcQ")
}

pub fn embed_unknown_url_returns_none_test() {
  let assert None = inlay.embed("https://www.example.com/page")
}

pub fn embed_with_custom_config_test() {
  let config =
    inlay.default_config()
    |> inlay.youtube(YoutubeConfig(no_cookie: False, aspect_ratio: None))
  let assert Some(el) =
    inlay.embed_with("https://www.youtube.com/watch?v=test123", config)
  let html = element.to_string(el)
  let assert True = string.contains(html, "www.youtube.com/embed/test123")
}

pub fn disabled_provider_returns_none_for_detect_test() {
  let config = inlay.default_config() |> inlay.no_youtube()
  let assert None =
    inlay.detect_with("https://www.youtube.com/watch?v=dQw4w9WgXcQ", config)
}

pub fn disabled_provider_returns_none_for_embed_test() {
  let config = inlay.default_config() |> inlay.no_youtube()
  let assert None =
    inlay.embed_with("https://www.youtube.com/watch?v=dQw4w9WgXcQ", config)
}

pub fn mastodon_detect_with_config_test() {
  let config =
    inlay.default_config()
    |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  let assert Some(MastodonPost(
    "mastodon.social",
    "iamkonstantin",
    "116391354521208947",
  )) =
    inlay.detect_with(
      "https://mastodon.social/@iamkonstantin/116391354521208947",
      config,
    )
}

pub fn mastodon_detect_without_config_returns_none_test() {
  let assert None =
    inlay.detect("https://mastodon.social/@iamkonstantin/116391354521208947")
}

pub fn pixelfed_detect_with_config_test() {
  let config =
    inlay.default_config()
    |> inlay.pixelfed(inlay.pixelfed_config(
      ["pixelfed.social"],
      Full(caption: True, likes: True),
    ))
  let assert Some(PixelfedPost(
    "pixelfed.social",
    "kkonstantin",
    "788060252604363209",
  )) =
    inlay.detect_with(
      "https://pixelfed.social/p/kkonstantin/788060252604363209",
      config,
    )
}

pub fn pixelfed_detect_without_config_returns_none_test() {
  let assert None =
    inlay.detect("https://pixelfed.social/p/kkonstantin/788060252604363209")
}

pub fn a_component_default_embeds_youtube_test() {
  let component = inlay.a_component_default()
  let el =
    component("https://www.youtube.com/watch?v=dQw4w9WgXcQ", None, [
      element.text("Watch this"),
    ])
  let html = element.to_string(el)
  let assert True =
    string.contains(html, "youtube-nocookie.com/embed/dQw4w9WgXcQ")
}

pub fn a_component_default_falls_through_for_unknown_test() {
  let component = inlay.a_component_default()
  let el =
    component("https://example.com", Some("Example"), [element.text("Example")])
  let html = element.to_string(el)
  let assert True = string.contains(html, "<a")
  let assert True = string.contains(html, "https://example.com")
  let assert True = string.contains(html, "Example")
}

pub fn a_component_with_custom_fallback_test() {
  let fallback = fn(href, _title, _children) { element.text("Link: " <> href) }
  let component = inlay.a_component(fallback)
  let el = component("https://example.com", None, [])
  let html = element.to_string(el)
  let assert True = string.contains(html, "Link: https://example.com")
}

pub fn a_component_with_twitch_config_test() {
  let config =
    inlay.default_config()
    |> inlay.twitch(inlay.twitch_config("mysite.com"))
  let fallback = fn(href, _title, _children) { element.text(href) }
  let component = inlay.a_component_with(config, fallback)
  let el = component("https://www.twitch.tv/ninja", None, [])
  let html = element.to_string(el)
  let assert True = string.contains(html, "player.twitch.tv")
  let assert True = string.contains(html, "mysite.com")
}

pub fn new_config_detects_nothing_test() {
  let assert None =
    inlay.detect_with(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      inlay.new(),
    )
}

pub fn new_config_with_enabled_provider_test() {
  let config =
    inlay.new()
    |> inlay.youtube(inlay.youtube_config())
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) =
    inlay.detect_with("https://www.youtube.com/watch?v=dQw4w9WgXcQ", config)
}

pub fn new_config_ignores_disabled_providers_test() {
  let config =
    inlay.new()
    |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  let assert None =
    inlay.detect_with("https://www.youtube.com/watch?v=dQw4w9WgXcQ", config)
}

pub fn new_config_mastodon_only_test() {
  let config =
    inlay.new()
    |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  let assert Some(MastodonPost(
    "mastodon.social",
    "iamkonstantin",
    "116391354521208947",
  )) =
    inlay.detect_with(
      "https://mastodon.social/@iamkonstantin/116391354521208947",
      config,
    )
}
