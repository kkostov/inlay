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

import gleam/dict.{type Dict}
import gleam/option.{type Option, None, Some}
import inlay/component
import inlay/detect
import inlay/embed.{Config}
import lustre
import lustre/attribute.{type Attribute}
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

pub type TwitterConfig =
  embed.TwitterConfig

pub type TikTokConfig =
  embed.TikTokConfig

pub type InstagramConfig =
  embed.InstagramConfig

/// Create a default Bluesky configuration with no handle resolver.
pub fn bluesky_config() -> BlueskyConfig {
  embed.bluesky_config()
}

/// Create a default Twitter/X configuration.
pub fn twitter_config() -> TwitterConfig {
  embed.twitter_config()
}

/// Create a default TikTok configuration.
pub fn tiktok_config() -> TikTokConfig {
  embed.tiktok_config()
}

/// Create a default Instagram configuration.
pub fn instagram_config() -> InstagramConfig {
  embed.instagram_config()
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

/// Pixelfed embed layout that shows the post with optional caption and likes.
pub fn pixelfed_full(
  caption caption: Bool,
  likes likes: Bool,
) -> PixelfedLayout {
  embed.Full(caption: caption, likes: likes)
}

/// Pixelfed embed layout that shows a compact view of the post.
pub fn pixelfed_compact() -> PixelfedLayout {
  embed.Compact
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

/// Set whether YouTube embeds use the privacy-enhanced `youtube-nocookie.com`
/// domain. Enabled by default.
pub fn youtube_no_cookie(
  config: YoutubeConfig,
  no_cookie: Bool,
) -> YoutubeConfig {
  embed.YoutubeConfig(..config, no_cookie: no_cookie)
}

/// Set whether Vimeo embeds include the Do Not Track flag.
/// Enabled by default.
pub fn vimeo_dnt(config: VimeoConfig, dnt: Bool) -> VimeoConfig {
  embed.VimeoConfig(..config, dnt: dnt)
}

/// Set a function that resolves a Bluesky handle (e.g. `"user.bsky.social"`)
/// to a DID. When provided, embeds render with richer Bluesky markup.
pub fn bluesky_resolver(
  config: BlueskyConfig,
  resolve: fn(String) -> Result(String, Nil),
) -> BlueskyConfig {
  embed.BlueskyConfig(..config, resolve_handle: Some(resolve))
}

/// Set the CSS aspect ratio (e.g. `"56.25%"`) for responsive YouTube embeds.
pub fn youtube_aspect_ratio(
  config: YoutubeConfig,
  aspect_ratio: String,
) -> YoutubeConfig {
  embed.YoutubeConfig(..config, aspect_ratio: Some(aspect_ratio))
}

/// Set the CSS aspect ratio (e.g. `"56.25%"`) for responsive Vimeo embeds.
pub fn vimeo_aspect_ratio(
  config: VimeoConfig,
  aspect_ratio: String,
) -> VimeoConfig {
  embed.VimeoConfig(..config, aspect_ratio: Some(aspect_ratio))
}

/// Set the CSS aspect ratio (e.g. `"56.25%"`) for responsive Twitch embeds.
pub fn twitch_aspect_ratio(
  config: TwitchConfig,
  aspect_ratio: String,
) -> TwitchConfig {
  embed.TwitchConfig(..config, aspect_ratio: Some(aspect_ratio))
}

/// Set the CSS aspect ratio (e.g. `"56.25%"`) for responsive TED embeds.
pub fn ted_aspect_ratio(config: TedConfig, aspect_ratio: String) -> TedConfig {
  let embed.TedConfig(..) = config
  embed.TedConfig(aspect_ratio: Some(aspect_ratio))
}

/// Set the CSS aspect ratio (e.g. `"56.25%"`) for responsive OpenStreetMap
/// embeds.
pub fn openstreetmap_aspect_ratio(
  config: OpenStreetMapConfig,
  aspect_ratio: String,
) -> OpenStreetMapConfig {
  let embed.OpenStreetMapConfig(..) = config
  embed.OpenStreetMapConfig(aspect_ratio: Some(aspect_ratio))
}

/// Set the Spotify embed width in pixels.
pub fn spotify_width(config: SpotifyConfig, width: Int) -> SpotifyConfig {
  embed.SpotifyConfig(..config, width: Some(width))
}

/// Set the Spotify embed height in pixels for albums, playlists, artists,
/// episodes, and shows.
pub fn spotify_height(config: SpotifyConfig, height: Int) -> SpotifyConfig {
  embed.SpotifyConfig(..config, height: Some(height))
}

/// Set the Spotify embed height in pixels for individual tracks.
pub fn spotify_track_height(
  config: SpotifyConfig,
  track_height: Int,
) -> SpotifyConfig {
  embed.SpotifyConfig(..config, track_height: Some(track_height))
}

/// Set the SoundCloud embed width in pixels.
pub fn soundcloud_width(
  config: SoundCloudConfig,
  width: Int,
) -> SoundCloudConfig {
  embed.SoundCloudConfig(..config, width: Some(width))
}

/// Set the SoundCloud embed height in pixels.
pub fn soundcloud_height(
  config: SoundCloudConfig,
  height: Int,
) -> SoundCloudConfig {
  embed.SoundCloudConfig(..config, height: Some(height))
}

/// Set the Apple Music embed maximum width in pixels.
pub fn apple_music_width(
  config: AppleMusicConfig,
  width: Int,
) -> AppleMusicConfig {
  embed.AppleMusicConfig(..config, width: Some(width))
}

/// Set the Apple Music embed height in pixels for albums, artists, playlists,
/// and music videos.
pub fn apple_music_height(
  config: AppleMusicConfig,
  height: Int,
) -> AppleMusicConfig {
  embed.AppleMusicConfig(..config, height: Some(height))
}

/// Set the Apple Music embed height in pixels for individual songs.
pub fn apple_music_song_height(
  config: AppleMusicConfig,
  song_height: Int,
) -> AppleMusicConfig {
  embed.AppleMusicConfig(..config, song_height: Some(song_height))
}

/// Set the Mastodon static embed width in pixels.
pub fn mastodon_width(config: MastodonConfig, width: Int) -> MastodonConfig {
  embed.MastodonConfig(..config, width: Some(width))
}

/// Set the initial Mastodon component-path iframe height in pixels.
pub fn mastodon_height(config: MastodonConfig, height: Int) -> MastodonConfig {
  embed.MastodonConfig(..config, height: Some(height))
}

/// Set the Pixelfed static embed width in pixels.
pub fn pixelfed_width(config: PixelfedConfig, width: Int) -> PixelfedConfig {
  embed.PixelfedConfig(..config, width: Some(width))
}

/// Set the initial Pixelfed component-path iframe height in pixels.
pub fn pixelfed_height(config: PixelfedConfig, height: Int) -> PixelfedConfig {
  embed.PixelfedConfig(..config, height: Some(height))
}

/// Set the initial Bluesky component-path iframe height in pixels.
pub fn bluesky_height(config: BlueskyConfig, height: Int) -> BlueskyConfig {
  embed.BlueskyConfig(..config, height: Some(height))
}

/// Set the initial Twitter/X component-path iframe height in pixels.
pub fn twitter_height(config: TwitterConfig, height: Int) -> TwitterConfig {
  let embed.TwitterConfig(..) = config
  embed.TwitterConfig(height: Some(height))
}

/// Set the initial TikTok component-path iframe height in pixels.
pub fn tiktok_height(config: TikTokConfig, height: Int) -> TikTokConfig {
  let embed.TikTokConfig(..) = config
  embed.TikTokConfig(height: Some(height))
}

/// Set the initial Instagram component-path iframe height in pixels.
pub fn instagram_height(
  config: InstagramConfig,
  height: Int,
) -> InstagramConfig {
  let embed.InstagramConfig(..) = config
  embed.InstagramConfig(height: Some(height))
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

/// Enable Twitter/X embeds with the given configuration.
pub fn twitter(config: Config, twitter_config: TwitterConfig) -> Config {
  Config(..config, twitter: Some(twitter_config))
}

/// Disable Twitter/X embeds.
pub fn no_twitter(config: Config) -> Config {
  Config(..config, twitter: None)
}

/// Enable TikTok embeds with the given configuration.
pub fn tiktok(config: Config, tiktok_config: TikTokConfig) -> Config {
  Config(..config, tiktok: Some(tiktok_config))
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

/// Enable Instagram embeds with the given configuration.
pub fn instagram(config: Config, instagram_config: InstagramConfig) -> Config {
  Config(..config, instagram: Some(instagram_config))
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
pub fn openstreetmap(
  config: Config,
  osm_config: OpenStreetMapConfig,
) -> Config {
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
pub fn soundcloud(
  config: Config,
  soundcloud_config: SoundCloudConfig,
) -> Config {
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
  detect.detect_with(url, config)
}

/// Render a detected embed as HTML using the default configuration.
pub fn render(embed: Embed) -> Element(msg) {
  detect.render_with(embed, default_config())
}

/// Render a detected embed as HTML using a custom configuration.
pub fn render_with(embed: Embed, config: Config) -> Element(msg) {
  detect.render_with(embed, config)
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
  fallback: fn(Dict(String, String), String, Option(String), List(Element(msg))) ->
    Element(msg),
) -> fn(Dict(String, String), String, Option(String), List(Element(msg))) ->
  Element(msg) {
  a_component_with(default_config(), fallback)
}

/// Create an anchor component with a custom configuration.
pub fn a_component_with(
  config: Config,
  fallback: fn(Dict(String, String), String, Option(String), List(Element(msg))) ->
    Element(msg),
) -> fn(Dict(String, String), String, Option(String), List(Element(msg))) ->
  Element(msg) {
  fn(
    attributes: Dict(String, String),
    href: String,
    title: Option(String),
    children: List(Element(msg)),
  ) {
    case embed_with(href, config) {
      Some(el) -> el
      None -> fallback(attributes, href, title, children)
    }
  }
}

/// Create an anchor component using the default configuration and
/// a standard `<a>` tag fallback.
pub fn a_component_default() -> fn(
  Dict(String, String),
  String,
  Option(String),
  List(Element(msg)),
) -> Element(msg) {
  a_component(default_fallback)
}

fn default_fallback(
  _attributes: Dict(String, String),
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

/// Register the `<inlay-embed url="…">` custom element with the given base
/// configuration. Call this once from a browser `main`, then use the tag in your
/// markup or [`embed_element`](#embed_element) in a Lustre view.
///
/// Registration is browser-only; on other targets it returns
/// `lustre.NotABrowser`.
pub fn configure(config: Config) -> Result(Nil, lustre.Error) {
  component.configure(config)
}

/// Register `<inlay-embed>` with the default configuration.
pub fn register() -> Result(Nil, lustre.Error) {
  component.register()
}

/// Render the `<inlay-embed>` custom-element tag with the given attributes.
pub fn embed_element(attributes: List(Attribute(msg))) -> Element(msg) {
  component.embed_element(attributes)
}
