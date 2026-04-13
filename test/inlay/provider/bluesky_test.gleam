import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{BlueskyPost}
import inlay/provider/bluesky
import lustre/element

pub fn standard_bluesky_url_test() {
  let assert Ok(url) =
    uri.parse("https://bsky.app/profile/jay.bsky.social/post/3jt5dwi5gzc2x")
  let assert Some(BlueskyPost("jay.bsky.social", "3jt5dwi5gzc2x")) =
    bluesky.detect(url)
}

pub fn did_handle_test() {
  let assert Ok(url) =
    uri.parse(
      "https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/post/3jt5abc",
    )
  let assert Some(BlueskyPost("did:plc:z72i7hdynmk6r22z27h6tvur", "3jt5abc")) =
    bluesky.detect(url)
}

pub fn custom_domain_handle_test() {
  let assert Ok(url) =
    uri.parse(
      "https://bsky.app/profile/flowvi.be/post/3mf7vlgfwgk2j",
    )
  let assert Some(BlueskyPost("flowvi.be", "3mf7vlgfwgk2j")) =
    bluesky.detect(url)
}

pub fn non_post_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://bsky.app/profile/jay.bsky.social")
  let assert None = bluesky.detect(url)
}

pub fn non_bluesky_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/profile/user/post/123")
  let assert None = bluesky.detect(url)
}

pub fn render_did_handle_test() {
  let e = BlueskyPost("did:plc:z72i7hdynmk6r22z27h6tvur", "3jt5abc")
  let html = element.to_string(bluesky.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "at://did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3jt5abc",
    )
  let assert True =
    string.contains(html, "embed.bsky.app/static/embed.js")
}

pub fn render_handle_without_resolver_test() {
  let e = BlueskyPost("jay.bsky.social", "3jt5dwi5gzc2x")
  let html = element.to_string(bluesky.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "bsky.app/profile/jay.bsky.social/post/3jt5dwi5gzc2x",
    )
  let assert False = string.contains(html, "embed.js")
  let assert False = string.contains(html, "data-bluesky-uri")
}

pub fn render_custom_domain_without_resolver_test() {
  let e = BlueskyPost("flowvi.be", "3mf7vlgfwgk2j")
  let html = element.to_string(bluesky.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "bsky.app/profile/flowvi.be/post/3mf7vlgfwgk2j",
    )
  let assert False = string.contains(html, "embed.js")
  let assert False = string.contains(html, "data-bluesky-uri")
}

pub fn render_with_resolver_returning_error_test() {
  let config =
    embed.Config(
      ..embed.default_config(),
      bluesky: Some(embed.BlueskyConfig(
        resolve_handle: Some(fn(_handle) { Error(Nil) }),
      )),
    )
  let e = BlueskyPost("alice.bsky.social", "3jt5dwi5gzc2x")
  let html = element.to_string(bluesky.render(e, config))
  let assert True =
    string.contains(
      html,
      "bsky.app/profile/alice.bsky.social/post/3jt5dwi5gzc2x",
    )
  let assert False = string.contains(html, "embed.js")
  let assert False = string.contains(html, "data-bluesky-uri")
}

pub fn render_with_resolver_test() {
  let config =
    embed.Config(
      ..embed.default_config(),
      bluesky: Some(embed.BlueskyConfig(
        resolve_handle: Some(fn(_handle) { Ok("did:plc:test123") }),
      )),
    )
  let e = BlueskyPost("flowvi.be", "3mf7vlgfwgk2j")
  let html = element.to_string(bluesky.render(e, config))
  let assert True =
    string.contains(
      html,
      "at://did:plc:test123/app.bsky.feed.post/3mf7vlgfwgk2j",
    )
  let assert True =
    string.contains(
      html,
      "bsky.app/profile/flowvi.be/post/3mf7vlgfwgk2j",
    )
  let assert True = string.contains(html, "embed.bsky.app/static/embed.js")
}
