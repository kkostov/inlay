import blogatto
import blogatto/config
import blogatto/error
import blogatto/post.{type Post}
import gleam/io
import gleam/option
import inlay
import inlay/embed
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

fn inlay_config() -> inlay.Config {
  inlay.new()
  |> inlay.youtube(inlay.youtube_config())
  |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  |> inlay.pixelfed(inlay.pixelfed_config(
    ["pixelfed.social"],
    embed.Full(caption: True, likes: True),
  ))
  |> inlay.spotify(inlay.spotify_config())
  |> inlay.apple_music(inlay.apple_music_config())
  |> inlay.openstreetmap(inlay.openstreetmap_config())
}

fn home_view(_posts: List(Post(Nil))) -> Element(Nil) {
  let mastodon_embed =
    inlay.embed_with(
      "https://mastodon.social/@iamkonstantin/116391354521208947",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let pixelfed_embed =
    inlay.embed_with(
      "https://pixelfed.social/p/kkonstantin/788060252604363209",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let youtube_embed =
    inlay.embed_with(
      "https://www.youtube.com/watch?v=XBu0m5JAUsA",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let bluesky_embed =
    inlay.embed(
      "https://bsky.app/profile/did:plc:bwm3ipmp7fidz67iy4atioa5/post/3max7rufmvp2y",
    )
    |> option.unwrap(element.none())

  let spotify_artist_embed =
    inlay.embed_with(
      "https://open.spotify.com/artist/7GyhmlEy51sGUE09A5AWzc?si=Thh-F4JSTCmx3I5D5Ofljw",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let spotify_track_embed =
    inlay.embed_with(
      "https://open.spotify.com/track/6dgOGIJjlUDGD7hJ0CbIJI?si=a7e23bbaf33b4b14",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let spotify_playlist_embed =
    inlay.embed_with(
      "https://open.spotify.com/playlist/3jsMM3KminuLxYCFy6PKFu?si=Gsighi56SB6HmtDrO3vI-w",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let apple_music_artist_embed =
    inlay.embed_with(
      "https://music.apple.com/be/artist/evanescence/42102393",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let apple_music_album_embed =
    inlay.embed_with(
      "https://music.apple.com/be/album/bleed-out/1699386566",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let apple_music_playlist_embed =
    inlay.embed_with(
      "https://music.apple.com/be/playlist/ramin-djawadi-essentials/pl.ac83e6e212d5400198f4c8c2110a2af1",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  let osm_embed =
    inlay.embed_with(
      "https://www.openstreetmap.org/relation/19189218#map=17/50.8949/4.3416",
      inlay_config(),
    )
    |> option.unwrap(element.none())

  html.html([], [
    html.head([], [
      html.meta([attribute.attribute("charset", "utf-8")]),
      html.meta([
        attribute.name("viewport"),
        attribute.attribute("content", "width=device-width, initial-scale=1"),
      ]),
      html.title([], "Inlay - render embedded links"),
      html.style([], css()),
    ]),
    html.body([], [
      html.div([attribute.class("container")], [
        html.h1([], [element.text("Inlay - render embedded links")]),
        html.p([attribute.class("subtitle")], [
          element.text("Example of embedded links"),
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Mastodon")]),
          mastodon_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Pixelfed")]),
          pixelfed_embed,
        ]),

        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("YouTube")]),
          youtube_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Bluesky")]),
          bluesky_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Spotify Artist")]),
          spotify_artist_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Spotify Track")]),
          spotify_track_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Spotify Playlist")]),
          spotify_playlist_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Apple Music Artist")]),
          apple_music_artist_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Apple Music Album")]),
          apple_music_album_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("Apple Music Playlist")]),
          apple_music_playlist_embed,
        ]),
        html.details([attribute.class("embed-section")], [
          html.summary([], [element.text("OpenStreetMap")]),
          osm_embed,
        ]),
      ]),
    ]),
  ])
}

fn css() -> String {
  "
body {
  background: #f4f1ee;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  color: #2c2c2c;
  margin: 0;
  padding: 2rem;
}
.container {
  max-width: 720px;
  margin: 0 auto;
}
h1 {
  font-size: 1.5rem;
  margin-bottom: 0.25rem;
}
p.subtitle {
  color: #666;
  margin-top: 0;
  margin-bottom: 2rem;
}
.embed-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.embed-section summary {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: #555;
  cursor: pointer;
}
.embed-section iframe {
  border-radius: 8px;
}
"
}

pub fn config() -> config.Config(Nil) {
  config.new("https://example.com")
  |> config.output_dir("./dist")
  |> config.route("/", home_view)
}

pub fn main() {
  case blogatto.build(config()) {
    Ok(Nil) -> io.println("Site built successfully in ./dist")
    Error(err) -> io.println("Build failed: " <> error.describe_error(err))
  }
}
