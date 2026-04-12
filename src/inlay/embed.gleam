import gleam/option.{type Option, None, Some}

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
}

pub type SpotifyMediaType {
  SpotifyPlaylist
  SpotifyTrack
  SpotifyAlbum
  SpotifyArtist
  SpotifyEpisode
  SpotifyShow
}

pub type InstagramPostType {
  Post
  Reel
  TV
}

pub type PixelfedLayout {
  Full
  Compact
}

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
  )
}

pub type YoutubeConfig {
  YoutubeConfig(no_cookie: Bool)
}

pub type VimeoConfig {
  VimeoConfig(dnt: Bool)
}

pub type SpotifyConfig {
  SpotifyConfig
}

pub type TwitterConfig {
  TwitterConfig
}

pub type TikTokConfig {
  TikTokConfig
}

pub type BlueskyConfig {
  BlueskyConfig
}

pub type InstagramConfig {
  InstagramConfig
}

pub type TwitchConfig {
  TwitchConfig(parent: String)
}

pub type OpenStreetMapConfig {
  OpenStreetMapConfig
}

pub type TedConfig {
  TedConfig
}

pub type SoundCloudConfig {
  SoundCloudConfig
}

pub type MastodonConfig {
  MastodonConfig(servers: List(String))
}

pub type PixelfedConfig {
  PixelfedConfig(
    servers: List(String),
    caption: Bool,
    likes: Bool,
    layout: PixelfedLayout,
  )
}

pub fn default_config() -> Config {
  Config(
    youtube: Some(YoutubeConfig(no_cookie: True)),
    vimeo: Some(VimeoConfig(dnt: True)),
    spotify: Some(SpotifyConfig),
    twitter: Some(TwitterConfig),
    tiktok: Some(TikTokConfig),
    bluesky: Some(BlueskyConfig),
    instagram: Some(InstagramConfig),
    twitch: None,
    openstreetmap: Some(OpenStreetMapConfig),
    ted: Some(TedConfig),
    soundcloud: Some(SoundCloudConfig),
    mastodon: None,
    pixelfed: None,
  )
}
