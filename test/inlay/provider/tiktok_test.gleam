import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{TikTokVideo}
import inlay/provider/tiktok
import lustre/element

pub fn standard_tiktok_url_test() {
  let assert Ok(url) =
    uri.parse("https://www.tiktok.com/@username/video/7123456789012345678")
  let assert Some(TikTokVideo("@username", "7123456789012345678")) =
    tiktok.detect(url)
}

pub fn tiktok_without_www_test() {
  let assert Ok(url) =
    uri.parse("https://tiktok.com/@someone/video/7123456789012345678")
  let assert Some(TikTokVideo("@someone", "7123456789012345678")) =
    tiktok.detect(url)
}

pub fn non_video_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://www.tiktok.com/@username")
  let assert None = tiktok.detect(url)
}

pub fn non_tiktok_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/@user/video/123")
  let assert None = tiktok.detect(url)
}

pub fn render_tiktok_video_test() {
  let e = TikTokVideo("@username", "7123456789012345678")
  let html = element.to_string(tiktok.render(e, embed.default_config()))
  let assert True = string.contains(html, "tiktok-embed")
  let assert True = string.contains(html, "7123456789012345678")
  let assert True = string.contains(html, "tiktok.com/embed.js")
}
