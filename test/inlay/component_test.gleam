import gleam/string
import inlay
import inlay/component
import inlay/embed
import lustre/attribute
import lustre/component as lustre_component
import lustre/element
import rsvp

fn render_url(config: embed.Config, url: String) -> String {
  lustre_component.prerender(
    component.embed_component(config),
    component.name,
    [attribute.attribute("url", url)],
    [],
  )
  |> element.to_string
}

pub fn embed_component_renders_youtube_test() {
  let html =
    render_url(
      embed.default_config(),
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    )
  let assert True =
    string.contains(html, "youtube-nocookie.com/embed/dQw4w9WgXcQ")
}

pub fn embed_component_renders_spotify_test() {
  let html =
    render_url(
      embed.default_config(),
      "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT",
    )
  let assert True =
    string.contains(html, "open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT")
}

pub fn embed_component_renders_mastodon_as_iframe_test() {
  let config =
    inlay.new()
    |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
  let html = render_url(config, "https://mastodon.social/@user/123456")
  let assert True = string.contains(html, "mastodon.social/@user/123456/embed")
  let assert True = string.contains(html, "<iframe")
  let assert True = string.contains(html, "inlay-embed-frame")
  let assert False = string.contains(html, "mastodon.social/embed.js")
}

pub fn embed_component_renders_pixelfed_as_iframe_test() {
  let config =
    inlay.new()
    |> inlay.pixelfed(inlay.pixelfed_config(
      ["pixelfed.social"],
      inlay.pixelfed_full(caption: True, likes: True),
    ))
  let html = render_url(config, "https://pixelfed.social/p/user/789")
  let assert True = string.contains(html, "pixelfed.social/p/user/789/embed")
  let assert True = string.contains(html, "<iframe")
  let assert False = string.contains(html, "pixelfed.social/embed.js")
}

pub fn embed_component_renders_twitter_as_iframe_test() {
  let html =
    render_url(embed.default_config(), "https://twitter.com/user/status/123456")
  let assert True =
    string.contains(html, "platform.twitter.com/embed/Tweet.html?id=123456")
  let assert True = string.contains(html, "<iframe")
  let assert False = string.contains(html, "platform.twitter.com/widgets.js")
}

pub fn embed_component_renders_instagram_as_iframe_test() {
  let html =
    render_url(embed.default_config(), "https://www.instagram.com/p/ABC123/")
  let assert True = string.contains(html, "instagram.com/p/ABC123/embed")
  let assert True = string.contains(html, "<iframe")
  let assert False = string.contains(html, "instagram.com/embed.js")
}

pub fn embed_component_renders_tiktok_as_iframe_test() {
  let html =
    render_url(
      embed.default_config(),
      "https://www.tiktok.com/@user/video/123456",
    )
  let assert True = string.contains(html, "tiktok.com/embed/v2/123456")
  let assert True = string.contains(html, "<iframe")
  let assert False = string.contains(html, "tiktok.com/embed.js")
}

pub fn embed_component_unknown_url_falls_back_to_link_test() {
  let html = render_url(embed.default_config(), "https://www.example.com/page")
  let assert True =
    string.contains(html, "href=\"https://www.example.com/page\"")
  let assert False = string.contains(html, "iframe")
}

pub fn embed_component_resolved_did_renders_rich_embed_test() {
  let config = embed.default_config()
  let #(model, _) =
    component.update(
      config,
      component.init(Nil).0,
      component.UrlChanged(
        "https://bsky.app/profile/flowvi.be/post/3mf7vlgfwgk2j",
      ),
    )
  let #(model, _) =
    component.update(config, model, component.GotDid(Ok("did:plc:test123")))
  let html = component.view(config, model) |> element.to_string
  let assert True =
    string.contains(
      html,
      "embed.bsky.app/embed/did:plc:test123/app.bsky.feed.post/3mf7vlgfwgk2j",
    )
  let assert True = string.contains(html, "<iframe")
  let assert False = string.contains(html, "embed.bsky.app/static/embed.js")
}

pub fn embed_component_failed_resolution_renders_fallback_test() {
  let config = embed.default_config()
  let #(model, _) =
    component.update(
      config,
      component.init(Nil).0,
      component.UrlChanged(
        "https://bsky.app/profile/alice.bsky.social/post/3jt5dwi5gzc2x",
      ),
    )
  let #(model, _) =
    component.update(config, model, component.GotDid(Error(rsvp.NetworkError)))
  let html = component.view(config, model) |> element.to_string
  let assert True =
    string.contains(
      html,
      "bsky.app/profile/alice.bsky.social/post/3jt5dwi5gzc2x",
    )
  let assert False = string.contains(html, "embed.js")
  let assert False = string.contains(html, "data-bluesky-uri")
}

pub fn embed_component_did_url_resolves_synchronously_test() {
  let config = embed.default_config()
  let #(model, _) =
    component.update(
      config,
      component.init(Nil).0,
      component.UrlChanged(
        "https://bsky.app/profile/did:plc:z72i7hdynmk6r22z27h6tvur/post/3jt5abc",
      ),
    )
  let assert component.Static = model.state
  let html = component.view(config, model) |> element.to_string
  let assert True =
    string.contains(
      html,
      "embed.bsky.app/embed/did:plc:z72i7hdynmk6r22z27h6tvur/app.bsky.feed.post/3jt5abc",
    )
  let assert True = string.contains(html, "<iframe")
}
