import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{Compact, Full, PixelfedPost}
import inlay/pixelfed
import lustre/element

fn pixelfed_config() -> embed.PixelfedConfig {
  embed.pixelfed_config(
    ["pixelfed.social", "pixelfed.de"],
    Full(caption: True, likes: True),
  )
}

fn full_config() -> embed.Config {
  embed.Config(
    ..embed.default_config(),
    pixelfed: Some(pixelfed_config()),
  )
}

fn compact_config() -> embed.PixelfedConfig {
  embed.pixelfed_config(["pixelfed.social"], Compact)
}

fn full_compact_config() -> embed.Config {
  embed.Config(
    ..embed.default_config(),
    pixelfed: Some(compact_config()),
  )
}

pub fn standard_pixelfed_url_test() {
  let assert Ok(url) =
    uri.parse("https://pixelfed.social/p/kkonstantin/788060252604363209")
  let assert Some(PixelfedPost(
    "pixelfed.social",
    "kkonstantin",
    "788060252604363209",
  )) = pixelfed.detect(url, pixelfed_config())
}

pub fn alternate_server_url_test() {
  let assert Ok(url) =
    uri.parse("https://pixelfed.de/p/fotograf/788060252604363209")
  let assert Some(PixelfedPost("pixelfed.de", "fotograf", "788060252604363209")) =
    pixelfed.detect(url, pixelfed_config())
}

pub fn unknown_server_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://unknown.instance/p/user/788060252604363209")
  let assert None = pixelfed.detect(url, pixelfed_config())
}

pub fn non_post_path_returns_none_test() {
  let assert Ok(url) = uri.parse("https://pixelfed.social/about")
  let assert None = pixelfed.detect(url, pixelfed_config())
}

pub fn profile_path_without_p_prefix_returns_none_test() {
  let assert Ok(url) = uri.parse("https://pixelfed.social/kkonstantin")
  let assert None = pixelfed.detect(url, pixelfed_config())
}

pub fn render_pixelfed_post_full_test() {
  let e = PixelfedPost("pixelfed.social", "kkonstantin", "788060252604363209")
  let assert Ok(el) = pixelfed.render(e, full_config())
  let html = element.to_string(el)
  let assert True =
    string.contains(
      html,
      "pixelfed.social/p/kkonstantin/788060252604363209/embed",
    )
  let assert True = string.contains(html, "caption=true")
  let assert True = string.contains(html, "likes=true")
  let assert True = string.contains(html, "layout=full")
  let assert True = string.contains(html, "pixelfed__embed")
  let assert True = string.contains(html, "pixelfed.social/embed.js")
  let assert True = string.contains(html, "Pixelfed Post Embed")
}

pub fn render_pixelfed_post_compact_test() {
  let e = PixelfedPost("pixelfed.social", "kkonstantin", "788060252604363209")
  let assert Ok(el) = pixelfed.render(e, full_compact_config())
  let html = element.to_string(el)
  let assert True = string.contains(html, "caption=false")
  let assert True = string.contains(html, "likes=false")
  let assert True = string.contains(html, "layout=compact")
}

pub fn render_script_tag_uses_correct_server_test() {
  let config =
    embed.Config(
      ..embed.default_config(),
      pixelfed: Some(embed.pixelfed_config(
        ["pixelfed.de"],
        Full(caption: True, likes: True),
      )),
    )
  let e = PixelfedPost("pixelfed.de", "fotograf", "788060252604363209")
  let assert Ok(el) = pixelfed.render(e, config)
  let html = element.to_string(el)
  let assert True = string.contains(html, "pixelfed.de/embed.js")
}
