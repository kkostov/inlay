import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{MastodonConfig, MastodonPost}
import inlay/provider/mastodon
import lustre/element

fn config_with_mastodon() -> embed.Config {
  embed.Config(
    ..embed.default_config(),
    mastodon: Some(MastodonConfig(
      servers: ["mastodon.social", "fosstodon.org"],
      width: None,
    )),
  )
}

pub fn standard_mastodon_url_test() {
  let assert Ok(url) =
    uri.parse("https://mastodon.social/@iamkonstantin/116391354521208947")
  let assert Some(MastodonPost(
    "mastodon.social",
    "iamkonstantin",
    "116391354521208947",
  )) = mastodon.detect(url, config_with_mastodon())
}

pub fn fosstodon_url_test() {
  let assert Ok(url) =
    uri.parse("https://fosstodon.org/@dev/112345678901234567")
  let assert Some(MastodonPost("fosstodon.org", "dev", "112345678901234567")) =
    mastodon.detect(url, config_with_mastodon())
}

pub fn unknown_server_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://unknown.instance/@user/112345678901234567")
  let assert None = mastodon.detect(url, config_with_mastodon())
}

pub fn no_mastodon_config_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://mastodon.social/@user/112345678901234567")
  let assert None = mastodon.detect(url, embed.default_config())
}

pub fn non_user_path_returns_none_test() {
  let assert Ok(url) = uri.parse("https://mastodon.social/about")
  let assert None = mastodon.detect(url, config_with_mastodon())
}

pub fn render_mastodon_post_test() {
  let e = MastodonPost("mastodon.social", "iamkonstantin", "116391354521208947")
  let html = element.to_string(mastodon.render(e, config_with_mastodon()))
  let assert True =
    string.contains(
      html,
      "mastodon.social/@iamkonstantin/116391354521208947/embed",
    )
  let assert True = string.contains(html, "mastodon-embed")
  let assert True = string.contains(html, "https://mastodon.social/embed.js")
  let assert True = string.contains(html, "sandbox")
}
