import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{MastodonPost}
import inlay/mastodon
import lustre/element

fn mastodon_config() -> embed.MastodonConfig {
  embed.mastodon_config(["mastodon.social", "fosstodon.org"])
}

fn full_config() -> embed.Config {
  embed.Config(
    ..embed.default_config(),
    mastodon: Some(mastodon_config()),
  )
}

pub fn standard_mastodon_url_test() {
  let assert Ok(url) =
    uri.parse("https://mastodon.social/@iamkonstantin/116391354521208947")
  let assert Some(MastodonPost(
    "mastodon.social",
    "iamkonstantin",
    "116391354521208947",
  )) = mastodon.detect(url, mastodon_config())
}

pub fn fosstodon_url_test() {
  let assert Ok(url) =
    uri.parse("https://fosstodon.org/@dev/112345678901234567")
  let assert Some(MastodonPost("fosstodon.org", "dev", "112345678901234567")) =
    mastodon.detect(url, mastodon_config())
}

pub fn unknown_server_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://unknown.instance/@user/112345678901234567")
  let assert None = mastodon.detect(url, mastodon_config())
}

pub fn non_user_path_returns_none_test() {
  let assert Ok(url) = uri.parse("https://mastodon.social/about")
  let assert None = mastodon.detect(url, mastodon_config())
}

pub fn render_mastodon_post_test() {
  let e = MastodonPost("mastodon.social", "iamkonstantin", "116391354521208947")
  let assert Ok(el) = mastodon.render(e, full_config())
  let html = element.to_string(el)
  let assert True =
    string.contains(
      html,
      "mastodon.social/@iamkonstantin/116391354521208947/embed",
    )
  let assert True = string.contains(html, "mastodon-embed")
  let assert True = string.contains(html, "https://mastodon.social/embed.js")
  let assert True = string.contains(html, "sandbox")
}
