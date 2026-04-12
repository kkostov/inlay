import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{InstagramPost, Post, Reel, TV}
import inlay/provider/instagram
import lustre/element

pub fn post_url_test() {
  let assert Ok(url) = uri.parse("https://www.instagram.com/p/CxYaBcDeFgH/")
  let assert Some(InstagramPost(Post, "CxYaBcDeFgH")) = instagram.detect(url)
}

pub fn post_without_trailing_slash_test() {
  let assert Ok(url) = uri.parse("https://www.instagram.com/p/CxYaBcDeFgH")
  let assert Some(InstagramPost(Post, "CxYaBcDeFgH")) = instagram.detect(url)
}

pub fn reel_url_test() {
  let assert Ok(url) = uri.parse("https://www.instagram.com/reel/CxYaBcDeFgH/")
  let assert Some(InstagramPost(Reel, "CxYaBcDeFgH")) = instagram.detect(url)
}

pub fn tv_url_test() {
  let assert Ok(url) = uri.parse("https://www.instagram.com/tv/CxYaBcDeFgH/")
  let assert Some(InstagramPost(TV, "CxYaBcDeFgH")) = instagram.detect(url)
}

pub fn instagram_without_www_test() {
  let assert Ok(url) = uri.parse("https://instagram.com/p/CxYaBcDeFgH/")
  let assert Some(InstagramPost(Post, "CxYaBcDeFgH")) = instagram.detect(url)
}

pub fn profile_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://www.instagram.com/username")
  let assert None = instagram.detect(url)
}

pub fn non_instagram_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/p/CxYaBcDeFgH/")
  let assert None = instagram.detect(url)
}

pub fn render_instagram_post_test() {
  let e = InstagramPost(Post, "CxYaBcDeFgH")
  let html = element.to_string(instagram.render(e, embed.default_config()))
  let assert True = string.contains(html, "instagram-media")
  let assert True = string.contains(html, "instagram.com/p/CxYaBcDeFgH/")
  let assert True = string.contains(html, "instagram.com/embed.js")
}

pub fn render_instagram_reel_test() {
  let e = InstagramPost(Reel, "CxYaBcDeFgH")
  let html = element.to_string(instagram.render(e, embed.default_config()))
  let assert True = string.contains(html, "instagram.com/reel/CxYaBcDeFgH/")
}
