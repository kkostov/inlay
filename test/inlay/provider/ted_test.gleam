import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{TedTalk}
import inlay/provider/ted
import lustre/element

pub fn standard_ted_talk_url_test() {
  let assert Ok(url) =
    uri.parse(
      "https://www.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
    )
  let assert Some(TedTalk("simon_sinek_how_great_leaders_inspire_action")) =
    ted.detect(url)
}

pub fn ted_without_www_test() {
  let assert Ok(url) = uri.parse("https://ted.com/talks/some_speaker_some_talk")
  let assert Some(TedTalk("some_speaker_some_talk")) = ted.detect(url)
}

pub fn non_talk_ted_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://www.ted.com/playlists/123")
  let assert None = ted.detect(url)
}

pub fn non_ted_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/talks/something")
  let assert None = ted.detect(url)
}

pub fn render_ted_talk_test() {
  let e = TedTalk("simon_sinek_how_great_leaders_inspire_action")
  let html = element.to_string(ted.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "embed.ted.com/talks/simon_sinek_how_great_leaders_inspire_action",
    )
  let assert True = string.contains(html, "allowfullscreen")
}
