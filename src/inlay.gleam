//// Render embedded previews for social media links as Lustre HTML elements.
////
//// Use `detect` to parse a URL into an `Embed`, `render` to turn it into
//// HTML, or `embed` to do both in one step. All functions have `_with`
//// variants that accept a custom `Config`.
////
//// ## Example
////
//// ```gleam
//// case inlay.embed("https://www.youtube.com/watch?v=dQw4w9WgXcQ") {
////   Some(element) -> element
////   None -> html.text("Not an embeddable link")
//// }
//// ```
////
//// ## Configuration
////
//// ```gleam
//// let config =
////   inlay.new()
////   |> inlay.youtube(inlay.youtube_config())
////   |> inlay.mastodon(inlay.mastodon_config(["mastodon.social"]))
//// ```

import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/apple_music
import inlay/bluesky
import inlay/embed.{
  AppleMusicMedia, BlueskyPost, Config, InstagramPost, MapLocation,
  MastodonPost, PixelfedPost, SoundCloudTrack, SpotifyMedia, TedTalk,
  TikTokVideo, Tweet, TwitchChannel, TwitchVideo, VimeoVideo, YoutubePlaylist,
  YoutubeVideo,
}
import inlay/instagram
import inlay/mastodon
import inlay/openstreetmap
import inlay/pixelfed
import inlay/soundcloud
import inlay/spotify
import inlay/ted
import inlay/tiktok
import inlay/twitch
import inlay/twitter
import inlay/vimeo
import inlay/youtube
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html

/// A detected embeddable link with provider-specific data.
/// Match on variants to inspect or handle providers individually.
pub type Embed =
  embed.Embed

pub type SpotifyMediaType =
  embed.SpotifyMediaType

pub type InstagramPostType =
  embed.InstagramPostType

/// Provider configuration. Create with `default_config()` or `new()`,
/// then customize with builder functions like `youtube()`, `no_twitter()`.
pub type Config =
  embed.Config

pub type YoutubeConfig =
  embed.YoutubeConfig

pub type VimeoConfig =
  embed.VimeoConfig

pub type SpotifyConfig =
  embed.SpotifyConfig

pub type BlueskyConfig =
  embed.BlueskyConfig

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

pub type AppleMusicConfig =
  embed.AppleMusicConfig

pub type AppleMusicMediaType =
  embed.AppleMusicMediaType

/// Create a default Bluesky configuration with no handle resolver.
pub fn bluesky_config() -> BlueskyConfig {
  embed.bluesky_config()
}

/// Create a default YouTube configuration with privacy-enhanced mode enabled.
pub fn youtube_config() -> YoutubeConfig {
  embed.youtube_config()
}

/// Create a default Vimeo configuration with Do Not Track enabled.
pub fn vimeo_config() -> VimeoConfig {
  embed.vimeo_config()
}

/// Create a default Spotify configuration.
pub fn spotify_config() -> SpotifyConfig {
  embed.spotify_config()
}

/// Create a Twitch configuration. The `parent` domain is required by
/// Twitch's embed API.
pub fn twitch_config(parent: String) -> TwitchConfig {
  embed.twitch_config(parent)
}

/// Create a default OpenStreetMap configuration.
pub fn openstreetmap_config() -> OpenStreetMapConfig {
  embed.openstreetmap_config()
}

/// Create a default TED configuration.
pub fn ted_config() -> TedConfig {
  embed.ted_config()
}

/// Create a default SoundCloud configuration.
pub fn soundcloud_config() -> SoundCloudConfig {
  embed.soundcloud_config()
}

/// Create a Mastodon configuration. Only posts from the listed `servers`
/// will be detected.
pub fn mastodon_config(servers: List(String)) -> MastodonConfig {
  embed.mastodon_config(servers)
}

/// Create a Pixelfed configuration. Only posts from the listed `servers`
/// will be detected.
pub fn pixelfed_config(
  servers: List(String),
  layout: PixelfedLayout,
) -> PixelfedConfig {
  embed.pixelfed_config(servers, layout)
}

/// Create a default Apple Music configuration.
pub fn apple_music_config() -> AppleMusicConfig {
  embed.apple_music_config()
}

/// Create a configuration with commonly used providers enabled.
///
/// Enabled: YouTube, Vimeo, Spotify, Twitter/X, TikTok, Bluesky,
/// Instagram, OpenStreetMap, TED, SoundCloud, Apple Music.
///
/// Disabled (require explicit setup): Twitch, Mastodon, Pixelfed.
pub fn default_config() -> Config {
  embed.default_config()
}

/// Create a configuration with all providers disabled.
/// Enable providers selectively with the builder functions.
pub fn new() -> Config {
  embed.new()
}

/// Enable YouTube embeds with the given configuration.
pub fn youtube(config: Config, youtube_config: YoutubeConfig) -> Config {
  Config(..config, youtube: Some(youtube_config))
}

/// Disable YouTube embeds.
pub fn no_youtube(config: Config) -> Config {
  Config(..config, youtube: None)
}

/// Enable Vimeo embeds with the given configuration.
pub fn vimeo(config: Config, vimeo_config: VimeoConfig) -> Config {
  Config(..config, vimeo: Some(vimeo_config))
}

/// Disable Vimeo embeds.
pub fn no_vimeo(config: Config) -> Config {
  Config(..config, vimeo: None)
}

/// Enable Spotify embeds with the given configuration.
pub fn spotify(config: Config, spotify_config: SpotifyConfig) -> Config {
  Config(..config, spotify: Some(spotify_config))
}

/// Disable Spotify embeds.
pub fn no_spotify(config: Config) -> Config {
  Config(..config, spotify: None)
}

/// Enable Twitter/X embeds.
pub fn twitter(config: Config) -> Config {
  Config(..config, twitter: Some(Nil))
}

/// Disable Twitter/X embeds.
pub fn no_twitter(config: Config) -> Config {
  Config(..config, twitter: None)
}

/// Enable TikTok embeds.
pub fn tiktok(config: Config) -> Config {
  Config(..config, tiktok: Some(Nil))
}

/// Disable TikTok embeds.
pub fn no_tiktok(config: Config) -> Config {
  Config(..config, tiktok: None)
}

/// Enable Bluesky embeds with the given configuration.
pub fn bluesky(config: Config, bluesky_config: BlueskyConfig) -> Config {
  Config(..config, bluesky: Some(bluesky_config))
}

/// Disable Bluesky embeds.
pub fn no_bluesky(config: Config) -> Config {
  Config(..config, bluesky: None)
}

/// Enable Instagram embeds.
pub fn instagram(config: Config) -> Config {
  Config(..config, instagram: Some(Nil))
}

/// Disable Instagram embeds.
pub fn no_instagram(config: Config) -> Config {
  Config(..config, instagram: None)
}

/// Enable Twitch embeds with the given configuration.
pub fn twitch(config: Config, twitch_config: TwitchConfig) -> Config {
  Config(..config, twitch: Some(twitch_config))
}

/// Disable Twitch embeds.
pub fn no_twitch(config: Config) -> Config {
  Config(..config, twitch: None)
}

/// Enable OpenStreetMap embeds with the given configuration.
pub fn openstreetmap(config: Config, osm_config: OpenStreetMapConfig) -> Config {
  Config(..config, openstreetmap: Some(osm_config))
}

/// Disable OpenStreetMap embeds.
pub fn no_openstreetmap(config: Config) -> Config {
  Config(..config, openstreetmap: None)
}

/// Enable TED talk embeds with the given configuration.
pub fn ted(config: Config, ted_config: TedConfig) -> Config {
  Config(..config, ted: Some(ted_config))
}

/// Disable TED talk embeds.
pub fn no_ted(config: Config) -> Config {
  Config(..config, ted: None)
}

/// Enable SoundCloud embeds with the given configuration.
pub fn soundcloud(config: Config, soundcloud_config: SoundCloudConfig) -> Config {
  Config(..config, soundcloud: Some(soundcloud_config))
}

/// Disable SoundCloud embeds.
pub fn no_soundcloud(config: Config) -> Config {
  Config(..config, soundcloud: None)
}

/// Enable Mastodon embeds with the given configuration.
pub fn mastodon(config: Config, mastodon_config: MastodonConfig) -> Config {
  Config(..config, mastodon: Some(mastodon_config))
}

/// Disable Mastodon embeds.
pub fn no_mastodon(config: Config) -> Config {
  Config(..config, mastodon: None)
}

/// Enable Pixelfed embeds with the given configuration.
pub fn pixelfed(config: Config, pixelfed_config: PixelfedConfig) -> Config {
  Config(..config, pixelfed: Some(pixelfed_config))
}

/// Disable Pixelfed embeds.
pub fn no_pixelfed(config: Config) -> Config {
  Config(..config, pixelfed: None)
}

/// Enable Apple Music embeds with the given configuration.
pub fn apple_music(
  config: Config,
  apple_music_config: AppleMusicConfig,
) -> Config {
  Config(..config, apple_music: Some(apple_music_config))
}

/// Disable Apple Music embeds.
pub fn no_apple_music(config: Config) -> Config {
  Config(..config, apple_music: None)
}

/// Detect an embeddable link from a URL using the default configuration.
pub fn detect(url: String) -> Option(Embed) {
  detect_with(url, default_config())
}

/// Detect an embeddable link from a URL using a custom configuration.
pub fn detect_with(url: String, config: Config) -> Option(Embed) {
  case uri.parse(url) {
    Ok(parsed) -> do_detect(parsed, config)
    Error(_) -> None
  }
}

/// Render a detected embed as HTML using the default configuration.
pub fn render(embed: Embed) -> Element(msg) {
  do_render(embed, default_config())
}

/// Render a detected embed as HTML using a custom configuration.
pub fn render_with(embed: Embed, config: Config) -> Element(msg) {
  do_render(embed, config)
}

/// Detect and render in one step using the default configuration.
pub fn embed(url: String) -> Option(Element(msg)) {
  case detect(url) {
    Some(e) -> Some(render(e))
    None -> None
  }
}

/// Detect and render in one step using a custom configuration.
pub fn embed_with(url: String, config: Config) -> Option(Element(msg)) {
  case detect_with(url, config) {
    Some(e) -> Some(render_with(e, config))
    None -> None
  }
}

/// Create an anchor component that renders embeds for recognized URLs
/// and delegates to `fallback` for unrecognized ones.
/// Uses the default configuration.
pub fn a_component(
  fallback: fn(String, Option(String), List(Element(msg))) -> Element(msg),
) -> fn(String, Option(String), List(Element(msg))) -> Element(msg) {
  a_component_with(default_config(), fallback)
}

/// Create an anchor component with a custom configuration.
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

/// Create an anchor component using the default configuration and
/// a standard `<a>` tag fallback.
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

fn do_detect(url: Uri, config: Config) -> Option(Embed) {
  use <- try_one_with(config.mastodon, url, mastodon.detect)
  use <- try_one_with(config.pixelfed, url, pixelfed.detect)
  use <- try_one(config.youtube, url, youtube.detect)
  use <- try_one(config.ted, url, ted.detect)
  use <- try_one(config.vimeo, url, vimeo.detect)
  use <- try_one(config.spotify, url, spotify.detect)
  use <- try_one(config.bluesky, url, bluesky.detect)
  use <- try_one(config.twitch, url, twitch.detect)
  use <- try_one(config.soundcloud, url, soundcloud.detect)
  use <- try_one(config.twitter, url, twitter.detect)
  use <- try_one(config.tiktok, url, tiktok.detect)
  use <- try_one(config.instagram, url, instagram.detect)
  use <- try_one(config.openstreetmap, url, openstreetmap.detect)
  use <- try_one(config.apple_music, url, apple_music.detect)
  None
}

fn do_render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    YoutubeVideo(..) | YoutubePlaylist(..) -> youtube.render(embed, config)
    VimeoVideo(..) -> vimeo.render(embed, config)
    SpotifyMedia(..) -> spotify.render(embed, config)
    Tweet(..) -> twitter.render(embed, config)
    TikTokVideo(..) -> tiktok.render(embed, config)
    BlueskyPost(..) -> bluesky.render(embed, config)
    InstagramPost(..) -> instagram.render(embed, config)
    TwitchChannel(..) | TwitchVideo(..) -> twitch.render(embed, config)
    MapLocation(..) -> openstreetmap.render(embed, config)
    TedTalk(..) -> ted.render(embed, config)
    SoundCloudTrack(..) -> soundcloud.render(embed, config)
    MastodonPost(..) -> mastodon.render(embed, config)
    PixelfedPost(..) -> pixelfed.render(embed, config)
    AppleMusicMedia(..) -> apple_music.render(embed, config)
  }
}

fn try_one(
  enabled: Option(a),
  url: Uri,
  detector: fn(Uri) -> Option(Embed),
  next: fn() -> Option(Embed),
) -> Option(Embed) {
  case enabled {
    Some(_) ->
      case detector(url) {
        Some(found) -> Some(found)
        None -> next()
      }
    None -> next()
  }
}

fn try_one_with(
  enabled: Option(a),
  url: Uri,
  detector: fn(Uri, a) -> Option(Embed),
  next: fn() -> Option(Embed),
) -> Option(Embed) {
  case enabled {
    Some(cfg) ->
      case detector(url, cfg) {
        Some(found) -> Some(found)
        None -> next()
      }
    None -> next()
  }
}
