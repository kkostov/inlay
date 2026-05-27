import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, Tweet}
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("twitter.com")
    | Some("www.twitter.com")
    | Some("x.com")
    | Some("www.x.com") -> detect_tweet(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    Tweet(handle, id) -> {
      let tweet_url = "https://twitter.com/" <> handle <> "/status/" <> id
      html.div([], [
        html.blockquote([attribute.class("twitter-tweet")], [
          html.a([attribute.href(tweet_url)], [
            element.text(tweet_url),
          ]),
        ]),
        html.script(
          [
            attribute.src("https://platform.twitter.com/widgets.js"),
            attribute.attribute("async", "true"),
            attribute.attribute("charset", "utf-8"),
          ],
          "",
        ),
      ])
    }
    _ -> panic as "unreachable"
  }
}

fn detect_tweet(url: Uri) -> Option(Embed) {
  case uri.path_segments(url.path) {
    [handle, "status", id] -> Some(Tweet(handle, id))
    _ -> None
  }
}
