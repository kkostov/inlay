import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{YoutubePlaylist, YoutubeVideo}
import inlay/provider/youtube
import lustre/element

pub fn standard_watch_url_test() {
  let assert Ok(url) = uri.parse("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) = youtube.detect(url)
}

pub fn watch_url_without_www_test() {
  let assert Ok(url) = uri.parse("https://youtube.com/watch?v=dQw4w9WgXcQ")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) = youtube.detect(url)
}

pub fn mobile_watch_url_test() {
  let assert Ok(url) = uri.parse("https://m.youtube.com/watch?v=dQw4w9WgXcQ")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) = youtube.detect(url)
}

pub fn short_url_test() {
  let assert Ok(url) = uri.parse("https://youtu.be/dQw4w9WgXcQ")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) = youtube.detect(url)
}

pub fn shorts_url_test() {
  let assert Ok(url) = uri.parse("https://www.youtube.com/shorts/abc123def45")
  let assert Some(YoutubeVideo("abc123def45", None, None)) = youtube.detect(url)
}

pub fn embed_url_test() {
  let assert Ok(url) = uri.parse("https://www.youtube.com/embed/dQw4w9WgXcQ")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", None, None)) = youtube.detect(url)
}

pub fn watch_with_start_time_test() {
  let assert Ok(url) =
    uri.parse("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=120")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", Some(120), None)) =
    youtube.detect(url)
}

pub fn watch_with_start_time_suffix_test() {
  let assert Ok(url) =
    uri.parse("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90s")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", Some(90), None)) =
    youtube.detect(url)
}

pub fn short_url_with_start_time_test() {
  let assert Ok(url) = uri.parse("https://youtu.be/dQw4w9WgXcQ?t=42")
  let assert Some(YoutubeVideo("dQw4w9WgXcQ", Some(42), None)) =
    youtube.detect(url)
}

pub fn watch_with_playlist_test() {
  let assert Ok(url) =
    uri.parse(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    )
  let assert Some(YoutubeVideo(
    "dQw4w9WgXcQ",
    None,
    Some("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf"),
  )) = youtube.detect(url)
}

pub fn playlist_url_test() {
  let assert Ok(url) =
    uri.parse(
      "https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    )
  let assert Some(YoutubePlaylist("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf")) =
    youtube.detect(url)
}

pub fn non_youtube_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://www.example.com/watch?v=abc")
  let assert None = youtube.detect(url)
}

pub fn watch_without_v_param_returns_none_test() {
  let assert Ok(url) = uri.parse("https://www.youtube.com/watch?feature=player")
  let assert None = youtube.detect(url)
}

pub fn playlist_without_list_param_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://www.youtube.com/playlist?feature=player")
  let assert None = youtube.detect(url)
}

pub fn render_video_nocookie_test() {
  let e = YoutubeVideo("dQw4w9WgXcQ", None, None)
  let html = element.to_string(youtube.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "youtube-nocookie.com/embed/dQw4w9WgXcQ")
  let assert True = string.contains(html, "allowfullscreen")
}

pub fn render_video_with_start_time_test() {
  let e = YoutubeVideo("abc123", Some(120), None)
  let html = element.to_string(youtube.render(e, embed.default_config()))
  let assert True =
    string.contains(html, "youtube-nocookie.com/embed/abc123?start=120")
}

pub fn render_playlist_test() {
  let e = YoutubePlaylist("PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf")
  let html = element.to_string(youtube.render(e, embed.default_config()))
  let assert True =
    string.contains(
      html,
      "youtube-nocookie.com/embed/videoseries?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf",
    )
}

pub fn render_video_cookie_domain_test() {
  let config =
    embed.Config(
      ..embed.default_config(),
      youtube: Some(embed.YoutubeConfig(no_cookie: False)),
    )
  let e = YoutubeVideo("test123", None, None)
  let html = element.to_string(youtube.render(e, config))
  let assert True = string.contains(html, "www.youtube.com/embed/test123")
}
