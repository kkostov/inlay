import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay
import inlay/embed.{VimeoVideo}
import inlay/vimeo
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
  let assert Ok(el) = vimeo.render(e, inlay.default_config())
  let html = element.to_string(el)
  let assert True =
    string.contains(html, "player.vimeo.com/video/76979871?dnt=1")
  let assert True = string.contains(html, "allowfullscreen")
}

pub fn render_vimeo_with_privacy_hash_test() {
  let e = VimeoVideo("76979871", Some("abc123"))
  let assert Ok(el) = vimeo.render(e, inlay.default_config())
  let html = element.to_string(el)
  let assert True =
    string.contains(html, "player.vimeo.com/video/76979871?dnt=1&amp;h=abc123")
}

pub fn render_vimeo_without_dnt_test() {
  let config =
    inlay.default_config()
    |> inlay.vimeo(inlay.vimeo_config() |> inlay.vimeo_dnt(False))
  let e = VimeoVideo("76979871", None)
  let assert Ok(el) = vimeo.render(e, config)
  let html = element.to_string(el)
  let assert True = string.contains(html, "player.vimeo.com/video/76979871")
  let assert False = string.contains(html, "dnt=1")
}
