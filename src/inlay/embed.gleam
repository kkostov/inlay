//// Types and configuration for embeddable social media links.

import gleam/option.{type Option, None, Some}

/// A detected embeddable social media link.
///
/// Each variant holds the data extracted from a URL, sufficient to render
/// the embed as HTML. Create values with `inlay.detect` or `inlay.detect_with`.
pub type Embed {
  YoutubeVideo(id: String, start_time: Option(Int), playlist: Option(String))
  YoutubePlaylist(id: String)
  VimeoVideo(id: String, privacy_hash: Option(String))
  SpotifyMedia(media_type: SpotifyMediaType, id: String)
  Tweet(handle: String, id: String)
  TikTokVideo(username: String, id: String)
  BlueskyPost(handle: String, rkey: String)
  InstagramPost(post_type: InstagramPostType, id: String)
  TwitchChannel(name: String)
  TwitchVideo(id: String)
  MapLocation(zoom: Int, lat: Float, long: Float)
  TedTalk(slug: String)
  SoundCloudTrack(path: String)
  MastodonPost(server: String, user: String, id: String)
  PixelfedPost(server: String, user: String, id: String)
  AppleMusicMedia(
    media_type: AppleMusicMediaType,
    country: String,
    slug: String,
    id: String,
  )
}

/// Spotify media types.
pub type SpotifyMediaType {
  SpotifyPlaylist
  SpotifyTrack
  SpotifyAlbum
  SpotifyArtist
  SpotifyEpisode
  SpotifyShow
}

/// Apple Music media types.
pub type AppleMusicMediaType {
  AppleMusicAlbum
  AppleMusicArtist
  AppleMusicPlaylist
  AppleMusicSong(track_id: String)
  AppleMusicMusicVideo
}

/// Instagram post types.
pub type InstagramPostType {
  Post
  Reel
  TV
}

/// Pixelfed embed layout.
pub type PixelfedLayout {
  Full(caption: Bool, likes: Bool)
  Compact
}

/// Configuration controlling which providers are enabled and their settings.
///
/// Each field is an `Option`: `Some(config)` enables the provider with the
/// given settings, `None` disables it.
///
/// Use `default_config()` for sensible defaults or `new()` to start with
/// all providers disabled and opt in selectively.
pub type Config {
  Config(
    youtube: Option(YoutubeConfig),
    vimeo: Option(VimeoConfig),
    spotify: Option(SpotifyConfig),
    twitter: Option(TwitterConfig),
    tiktok: Option(TikTokConfig),
    bluesky: Option(BlueskyConfig),
    instagram: Option(InstagramConfig),
    twitch: Option(TwitchConfig),
    openstreetmap: Option(OpenStreetMapConfig),
    ted: Option(TedConfig),
    soundcloud: Option(SoundCloudConfig),
    mastodon: Option(MastodonConfig),
    pixelfed: Option(PixelfedConfig),
    apple_music: Option(AppleMusicConfig),
  )
}

/// YouTube embed settings.
pub type YoutubeConfig {
  YoutubeConfig(no_cookie: Bool, aspect_ratio: Option(String))
}

/// Vimeo embed settings.
pub type VimeoConfig {
  VimeoConfig(dnt: Bool, aspect_ratio: Option(String))
}

/// Spotify embed settings.
pub type SpotifyConfig {
  SpotifyConfig(
    width: Option(Int),
    height: Option(Int),
    track_height: Option(Int),
  )
}

/// Bluesky embed settings.
///
/// The optional `resolve_handle` function converts a Bluesky handle
/// (e.g. `"user.bsky.social"`) to a DID for richer embed rendering. `height`
/// is the initial component-path iframe height before the embed reports its
/// own size.
pub type BlueskyConfig {
  BlueskyConfig(
    resolve_handle: Option(fn(String) -> Result(String, Nil)),
    height: Option(Int),
  )
}

/// Twitter/X embed settings. `height` is the initial component-path iframe
/// height before the embed reports its own size.
pub type TwitterConfig {
  TwitterConfig(height: Option(Int))
}

/// TikTok embed settings. `height` is the initial component-path iframe height
/// before the embed reports its own size.
pub type TikTokConfig {
  TikTokConfig(height: Option(Int))
}

/// Instagram embed settings. `height` is the initial component-path iframe
/// height before the embed reports its own size.
pub type InstagramConfig {
  InstagramConfig(height: Option(Int))
}

/// Twitch embed settings. The `parent` domain is required by Twitch's
/// embed API.
pub type TwitchConfig {
  TwitchConfig(parent: String, aspect_ratio: Option(String))
}

/// OpenStreetMap embed settings.
pub type OpenStreetMapConfig {
  OpenStreetMapConfig(aspect_ratio: Option(String))
}

/// TED talk embed settings.
pub type TedConfig {
  TedConfig(aspect_ratio: Option(String))
}

/// SoundCloud embed settings.
pub type SoundCloudConfig {
  SoundCloudConfig(width: Option(Int), height: Option(Int))
}

/// Mastodon embed settings. Only posts from listed `servers` are detected.
/// `width` sizes the static embed; `height` is the initial component-path
/// iframe height before the embed reports its own size.
pub type MastodonConfig {
  MastodonConfig(servers: List(String), width: Option(Int), height: Option(Int))
}

/// Pixelfed embed settings. Only posts from listed `servers` are detected.
/// `width` sizes the static embed; `height` is the initial component-path
/// iframe height before the embed reports its own size.
pub type PixelfedConfig {
  PixelfedConfig(
    servers: List(String),
    layout: PixelfedLayout,
    width: Option(Int),
    height: Option(Int),
  )
}

/// Apple Music embed settings.
pub type AppleMusicConfig {
  AppleMusicConfig(
    width: Option(Int),
    height: Option(Int),
    song_height: Option(Int),
  )
}

/// Create a default Bluesky configuration with no handle resolver.
pub fn bluesky_config() -> BlueskyConfig {
  BlueskyConfig(resolve_handle: None, height: None)
}

/// Create a default Twitter/X configuration.
pub fn twitter_config() -> TwitterConfig {
  TwitterConfig(height: None)
}

/// Create a default TikTok configuration.
pub fn tiktok_config() -> TikTokConfig {
  TikTokConfig(height: None)
}

/// Create a default Instagram configuration.
pub fn instagram_config() -> InstagramConfig {
  InstagramConfig(height: None)
}

/// Create a default YouTube configuration with privacy-enhanced mode enabled.
pub fn youtube_config() -> YoutubeConfig {
  YoutubeConfig(no_cookie: True, aspect_ratio: None)
}

/// Create a default Vimeo configuration with Do Not Track enabled.
pub fn vimeo_config() -> VimeoConfig {
  VimeoConfig(dnt: True, aspect_ratio: None)
}

/// Create a default Spotify configuration.
pub fn spotify_config() -> SpotifyConfig {
  SpotifyConfig(width: None, height: None, track_height: None)
}

/// Create a Twitch configuration with the required parent domain.
pub fn twitch_config(parent: String) -> TwitchConfig {
  TwitchConfig(parent: parent, aspect_ratio: None)
}

/// Create a default OpenStreetMap configuration.
pub fn openstreetmap_config() -> OpenStreetMapConfig {
  OpenStreetMapConfig(aspect_ratio: None)
}

/// Create a default TED configuration.
pub fn ted_config() -> TedConfig {
  TedConfig(aspect_ratio: None)
}

/// Create a default SoundCloud configuration.
pub fn soundcloud_config() -> SoundCloudConfig {
  SoundCloudConfig(width: None, height: None)
}

/// Create a Mastodon configuration for the given server allowlist.
pub fn mastodon_config(servers: List(String)) -> MastodonConfig {
  MastodonConfig(servers: servers, width: None, height: None)
}

/// Create a Pixelfed configuration for the given server allowlist and layout.
pub fn pixelfed_config(
  servers: List(String),
  layout: PixelfedLayout,
) -> PixelfedConfig {
  PixelfedConfig(servers: servers, layout: layout, width: None, height: None)
}

/// Create a default Apple Music configuration.
pub fn apple_music_config() -> AppleMusicConfig {
  AppleMusicConfig(width: None, height: None, song_height: None)
}

/// Create a default configuration with commonly used providers enabled.
///
/// Enabled: YouTube, Vimeo, Spotify, Twitter/X, TikTok, Bluesky,
/// Instagram, OpenStreetMap, TED, SoundCloud, Apple Music.
///
/// Disabled (require explicit setup): Twitch, Mastodon, Pixelfed.
pub fn default_config() -> Config {
  Config(
    youtube: Some(youtube_config()),
    vimeo: Some(vimeo_config()),
    spotify: Some(spotify_config()),
    twitter: Some(twitter_config()),
    tiktok: Some(tiktok_config()),
    bluesky: Some(bluesky_config()),
    instagram: Some(instagram_config()),
    twitch: None,
    openstreetmap: Some(openstreetmap_config()),
    ted: Some(ted_config()),
    soundcloud: Some(soundcloud_config()),
    mastodon: None,
    pixelfed: None,
    apple_music: Some(apple_music_config()),
  )
}

/// Create an empty configuration with all providers disabled.
/// Enable providers selectively with the builder functions in the `inlay`
/// module.
pub fn new() -> Config {
  Config(
    youtube: None,
    vimeo: None,
    spotify: None,
    twitter: None,
    tiktok: None,
    bluesky: None,
    instagram: None,
    twitch: None,
    openstreetmap: None,
    ted: None,
    soundcloud: None,
    mastodon: None,
    pixelfed: None,
    apple_music: None,
  )
}
