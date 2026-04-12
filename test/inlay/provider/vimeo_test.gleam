import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{VimeoVideo}
import inlay/provider/vimeo
import lustre/element

pub fn standard_vimeo_url_test() {
  let assert Ok(url) = uri.parse("https://vimeo.com/76979871")
  let assert Some(VimeoVideo("76979871", None)) = vimeo.detect(url)
}

pub fn vimeo_with_www_test() {
  let assert Ok(url) = uri.parse("https://www.vimeo.com/76979871")
  let assert Some(VimeoVideo("76979871", None)) = vimeo.detect(url)
}

pub fn vimeo_with_privacy_hash_test() {
  let assert Ok(url) = uri.parse("https://vimeo.com/76979871/abc123def456")
  let assert Some(VimeoVideo("76979871", Some("abc123def456"))) =
    vimeo.detect(url)
}

pub fn non_vimeo_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/76979871")
  let assert None = vimeo.detect(url)
}

pub fn vimeo_root_returns_none_test() {
  let assert Ok(url) = uri.parse("https://vimeo.com/")
  let assert None = vimeo.detect(url)
}

pub fn render_vimeo_with_dnt_test() {
  let e = VimeoVideo("76979871", None)
  let html = element.to_string(vimeo.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "player.vimeo.com/video/76979871?dnt=1")
  let assert True = string.contains(html, "allowfullscreen")
}

pub fn render_vimeo_with_privacy_hash_test() {
  let e = VimeoVideo("76979871", Some("abc123"))
  let html = element.to_string(vimeo.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "player.vimeo.com/video/76979871?dnt=1&amp;h=abc123")
}

pub fn render_vimeo_without_dnt_test() {
  let config =
    embed.Config(
      ..embed.default_config(),
      vimeo: Some(embed.VimeoConfig(dnt: False)),
    )
  let e = VimeoVideo("76979871", None)
  let html = element.to_string(vimeo.render(e, config))
  let assert True = string.contains(html, "player.vimeo.com/video/76979871")
  let assert False = string.contains(html, "dnt=1")
}
