import inlay
import lustre
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

fn config() -> inlay.Config {
  inlay.default_config()
  |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  |> inlay.pixelfed(inlay.pixelfed_config(
    ["pixelfed.social"],
    inlay.pixelfed_full(caption: True, likes: True),
  ))
}

fn embed(url: String) -> Element(msg) {
  inlay.embed_element([attribute.attribute("url", url)])
}

fn view() -> Element(msg) {
  html.div([attribute.class("container")], [
    html.style([], css()),
    html.h1([], [element.text("Inlay: Lustre component demo")]),
    html.p([attribute.class("subtitle")], [
      element.text("Embeds rendered by the "),
      html.code([], [element.text("<inlay-embed>")]),
      element.text(" component. These render entirely client-side!"),
    ]),
    section(
      "Mastodon",
      embed("https://mastodon.social/@iamkonstantin/116391354521208947"),
    ),
    section(
      "Pixelfed",
      embed("https://pixelfed.social/p/kkonstantin/788060252604363209"),
    ),
    section("YouTube", embed("https://www.youtube.com/watch?v=XBu0m5JAUsA")),
    section(
      "Bluesky",
      embed(
        "https://bsky.app/profile/did:plc:bwm3ipmp7fidz67iy4atioa5/post/3max7rufmvp2y",
      ),
    ),
    section(
      "Spotify Artist",
      embed(
        "https://open.spotify.com/artist/7GyhmlEy51sGUE09A5AWzc?si=Thh-F4JSTCmx3I5D5Ofljw",
      ),
    ),
    section(
      "Spotify Track",
      embed(
        "https://open.spotify.com/track/6dgOGIJjlUDGD7hJ0CbIJI?si=a7e23bbaf33b4b14",
      ),
    ),
    section(
      "Spotify Playlist",
      embed(
        "https://open.spotify.com/playlist/3jsMM3KminuLxYCFy6PKFu?si=Gsighi56SB6HmtDrO3vI-w",
      ),
    ),
    section(
      "Apple Music Artist",
      embed("https://music.apple.com/be/artist/evanescence/42102393"),
    ),
    section(
      "Apple Music Album",
      embed("https://music.apple.com/be/album/bleed-out/1699386566"),
    ),
    section(
      "Apple Music Playlist",
      embed(
        "https://music.apple.com/be/playlist/ramin-djawadi-essentials/pl.ac83e6e212d5400198f4c8c2110a2af1",
      ),
    ),
    section(
      "OpenStreetMap",
      embed(
        "https://www.openstreetmap.org/relation/19189218#map=17/50.8949/4.3416",
      ),
    ),
  ])
}

fn section(title: String, content: Element(msg)) -> Element(msg) {
  html.details([attribute.class("embed-section")], [
    html.summary([], [element.text(title)]),
    content,
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

pub fn main() -> Nil {
  let assert Ok(Nil) = inlay.configure(config())
  let assert Ok(_) = lustre.start(lustre.element(view()), "#app", Nil)
  Nil
}
