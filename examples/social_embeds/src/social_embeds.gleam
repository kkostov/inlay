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
  |> inlay.youtube(embed.YoutubeConfig(no_cookie: True))
  |> inlay.mastodon(embed.MastodonConfig(servers: ["mastodon.social"]))
  |> inlay.pixelfed(embed.PixelfedConfig(
    servers: ["pixelfed.social"],
    layout: embed.Full(caption: True, likes: True),
  ))
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
    inlay.embed("https://bsky.app/profile/did:plc:bwm3ipmp7fidz67iy4atioa5/post/3max7rufmvp2y")
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
        html.div([attribute.class("embed-section")], [
          html.h2([], [element.text("Mastodon")]),
          mastodon_embed,
        ]),
        html.div([attribute.class("embed-section")], [
          html.h2([], [element.text("Pixelfed")]),
          pixelfed_embed,
        ]),

        html.div([attribute.class("embed-section")], [
          html.h2([], [element.text("YouTube")]),
          youtube_embed,
        ]),
        html.div([attribute.class("embed-section")], [
          html.h2([], [element.text("Bluesky")]),
          bluesky_embed,
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
.embed-section h2 {
  font-size: 1.1rem;
  margin-top: 0;
  margin-bottom: 1rem;
  color: #555;
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
