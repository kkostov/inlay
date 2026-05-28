import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay
import inlay/embed.{TwitchChannel, TwitchVideo}
import inlay/twitch
import lustre/element

pub fn channel_url_test() {
  let assert Ok(url) = uri.parse("https://www.twitch.tv/ninja")
  let assert Some(TwitchChannel("ninja")) = twitch.detect(url)
}

pub fn channel_without_www_test() {
  let assert Ok(url) = uri.parse("https://twitch.tv/ninja")
  let assert Some(TwitchChannel("ninja")) = twitch.detect(url)
}

pub fn video_url_test() {
  let assert Ok(url) = uri.parse("https://www.twitch.tv/videos/123456789")
  let assert Some(TwitchVideo("123456789")) = twitch.detect(url)
}

pub fn non_twitch_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/ninja")
  let assert None = twitch.detect(url)
}

pub fn render_channel_with_parent_test() {
  let config =
    inlay.default_config()
    |> inlay.twitch(inlay.twitch_config("mysite.com"))
  let e = TwitchChannel("ninja")
  let assert Ok(el) = twitch.render(e, config)
  let html = element.to_string(el)
  let assert True = string.contains(html, "player.twitch.tv/?channel=ninja")
  let assert True = string.contains(html, "mysite.com")
}

pub fn render_video_with_parent_test() {
  let config =
    inlay.default_config()
    |> inlay.twitch(inlay.twitch_config("mysite.com"))
  let e = TwitchVideo("123456789")
  let assert Ok(el) = twitch.render(e, config)
  let html = element.to_string(el)
  let assert True = string.contains(html, "player.twitch.tv/?video=123456789")
}
