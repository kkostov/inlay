import gleam/option.{type Option, None, Some}
import gleam/uri
import inlay/embed.{Config}
import inlay/provider
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

pub type Embed =
  embed.Embed

pub type SpotifyMediaType =
  embed.SpotifyMediaType

pub type InstagramPostType =
  embed.InstagramPostType

pub type Config =
  embed.Config

pub type YoutubeConfig =
  embed.YoutubeConfig

pub type VimeoConfig =
  embed.VimeoConfig

pub type SpotifyConfig =
  embed.SpotifyConfig

pub type TwitterConfig =
  embed.TwitterConfig

pub type TikTokConfig =
  embed.TikTokConfig

pub type BlueskyConfig =
  embed.BlueskyConfig

pub type InstagramConfig =
  embed.InstagramConfig

pub type TwitchConfig =
  embed.TwitchConfig

pub type OpenStreetMapConfig =
  embed.OpenStreetMapConfig

pub type TedConfig =
  embed.TedConfig

pub type SoundCloudConfig =
  embed.SoundCloudConfig

pub type MastodonConfig =
  embed.MastodonConfig

pub type PixelfedConfig =
  embed.PixelfedConfig

pub type PixelfedLayout =
  embed.PixelfedLayout

pub fn bluesky_config() -> BlueskyConfig {
  embed.bluesky_config()
}

pub fn default_config() -> Config {
  embed.default_config()
}

pub fn new() -> Config {
  embed.new()
}

pub fn youtube(config: Config, youtube_config: YoutubeConfig) -> Config {
  Config(..config, youtube: Some(youtube_config))
}

pub fn no_youtube(config: Config) -> Config {
  Config(..config, youtube: None)
}

pub fn vimeo(config: Config, vimeo_config: VimeoConfig) -> Config {
  Config(..config, vimeo: Some(vimeo_config))
}

pub fn no_vimeo(config: Config) -> Config {
  Config(..config, vimeo: None)
}

pub fn spotify(config: Config, spotify_config: SpotifyConfig) -> Config {
  Config(..config, spotify: Some(spotify_config))
}

pub fn no_spotify(config: Config) -> Config {
  Config(..config, spotify: None)
}

pub fn twitter(config: Config, twitter_config: TwitterConfig) -> Config {
  Config(..config, twitter: Some(twitter_config))
}

pub fn no_twitter(config: Config) -> Config {
  Config(..config, twitter: None)
}

pub fn tiktok(config: Config, tiktok_config: TikTokConfig) -> Config {
  Config(..config, tiktok: Some(tiktok_config))
}

pub fn no_tiktok(config: Config) -> Config {
  Config(..config, tiktok: None)
}

pub fn bluesky(config: Config, bluesky_config: BlueskyConfig) -> Config {
  Config(..config, bluesky: Some(bluesky_config))
}

pub fn no_bluesky(config: Config) -> Config {
  Config(..config, bluesky: None)
}

pub fn instagram(config: Config, instagram_config: InstagramConfig) -> Config {
  Config(..config, instagram: Some(instagram_config))
}

pub fn no_instagram(config: Config) -> Config {
  Config(..config, instagram: None)
}

pub fn twitch(config: Config, twitch_config: TwitchConfig) -> Config {
  Config(..config, twitch: Some(twitch_config))
}

pub fn no_twitch(config: Config) -> Config {
  Config(..config, twitch: None)
}

pub fn openstreetmap(config: Config, osm_config: OpenStreetMapConfig) -> Config {
  Config(..config, openstreetmap: Some(osm_config))
}

pub fn no_openstreetmap(config: Config) -> Config {
  Config(..config, openstreetmap: None)
}

pub fn ted(config: Config, ted_config: TedConfig) -> Config {
  Config(..config, ted: Some(ted_config))
}

pub fn no_ted(config: Config) -> Config {
  Config(..config, ted: None)
}

pub fn soundcloud(config: Config, soundcloud_config: SoundCloudConfig) -> Config {
  Config(..config, soundcloud: Some(soundcloud_config))
}

pub fn no_soundcloud(config: Config) -> Config {
  Config(..config, soundcloud: None)
}

pub fn mastodon(config: Config, mastodon_config: MastodonConfig) -> Config {
  Config(..config, mastodon: Some(mastodon_config))
}

pub fn no_mastodon(config: Config) -> Config {
  Config(..config, mastodon: None)
}

pub fn pixelfed(config: Config, pixelfed_config: PixelfedConfig) -> Config {
  Config(..config, pixelfed: Some(pixelfed_config))
}

pub fn no_pixelfed(config: Config) -> Config {
  Config(..config, pixelfed: None)
}

pub fn detect(url: String) -> Option(Embed) {
  detect_with(url, default_config())
}

pub fn detect_with(url: String, config: Config) -> Option(Embed) {
  case uri.parse(url) {
    Ok(parsed) -> provider.detect(parsed, config)
    Error(_) -> None
  }
}

pub fn render(embed: Embed) -> Element(msg) {
  provider.render(embed, default_config())
}

pub fn render_with(embed: Embed, config: Config) -> Element(msg) {
  provider.render(embed, config)
}

pub fn embed(url: String) -> Option(Element(msg)) {
  case detect(url) {
    Some(e) -> Some(render(e))
    None -> None
  }
}

pub fn embed_with(url: String, config: Config) -> Option(Element(msg)) {
  case detect_with(url, config) {
    Some(e) -> Some(render_with(e, config))
    None -> None
  }
}

pub fn a_component(
  fallback: fn(String, Option(String), List(Element(msg))) -> Element(msg),
) -> fn(String, Option(String), List(Element(msg))) -> Element(msg) {
  a_component_with(default_config(), fallback)
}

pub fn a_component_with(
  config: Config,
  fallback: fn(String, Option(String), List(Element(msg))) -> Element(msg),
) -> fn(String, Option(String), List(Element(msg))) -> Element(msg) {
  fn(href: String, title: Option(String), children: List(Element(msg))) {
    case embed_with(href, config) {
      Some(el) -> el
      None -> fallback(href, title, children)
    }
  }
}

pub fn a_component_default() -> fn(String, Option(String), List(Element(msg))) ->
  Element(msg) {
  a_component(default_fallback)
}

fn default_fallback(
  href: String,
  title: Option(String),
  children: List(Element(msg)),
) -> Element(msg) {
  let attrs = [attribute.href(href)]
  let attrs = case title {
    Some(t) -> [attribute.title(t), ..attrs]
    None -> attrs
  }
  html.a(attrs, children)
}
