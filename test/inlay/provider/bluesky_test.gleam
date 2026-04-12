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

pub fn non_post_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://bsky.app/profile/jay.bsky.social")
  let assert None = bluesky.detect(url)
}

pub fn non_bluesky_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/profile/user/post/123")
  let assert None = bluesky.detect(url)
}

pub fn render_bluesky_post_test() {
  let e = BlueskyPost("jay.bsky.social", "3jt5dwi5gzc2x")
  let html = element.to_string(bluesky.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "embed.bsky.app/embed/jay.bsky.social/post/3jt5dwi5gzc2x",
    )
}
