import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{Tweet}
import inlay/provider/twitter
import lustre/element

pub fn twitter_com_url_test() {
  let assert Ok(url) =
    uri.parse("https://twitter.com/elikiiii/status/1740473673205620863")
  let assert Some(Tweet("elikiiii", "1740473673205620863")) =
    twitter.detect(url)
}

pub fn www_twitter_com_url_test() {
  let assert Ok(url) = uri.parse("https://www.twitter.com/user/status/123")
  let assert Some(Tweet("user", "123")) = twitter.detect(url)
}

pub fn x_com_url_test() {
  let assert Ok(url) =
    uri.parse("https://x.com/elikiiii/status/1740473673205620863")
  let assert Some(Tweet("elikiiii", "1740473673205620863")) =
    twitter.detect(url)
}

pub fn www_x_com_url_test() {
  let assert Ok(url) = uri.parse("https://www.x.com/user/status/123")
  let assert Some(Tweet("user", "123")) = twitter.detect(url)
}

pub fn non_status_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://twitter.com/user")
  let assert None = twitter.detect(url)
}

pub fn non_twitter_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/user/status/123")
  let assert None = twitter.detect(url)
}

pub fn render_tweet_test() {
  let e = Tweet("elikiiii", "1740473673205620863")
  let html = element.to_string(twitter.render(e, embed.default_config()))
  let assert True = string.contains(html, "twitter-tweet")
  let assert True =
    string.contains(html, "twitter.com/elikiiii/status/1740473673205620863")
  let assert True = string.contains(html, "platform.twitter.com/widgets.js")
}
