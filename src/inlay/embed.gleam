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
  AppleMusicMedia(
    media_type: AppleMusicMediaType,
    country: String,
    slug: String,
    id: String,
  )
}

pub type AppleMusicMediaType {
  AppleMusicAlbum
  AppleMusicArtist
  AppleMusicPlaylist
  AppleMusicSong(track_id: String)
  AppleMusicMusicVideo
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
  Full(caption: Bool, likes: Bool)
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
    apple_music: Option(AppleMusicConfig),
  )
}

pub type YoutubeConfig {
  YoutubeConfig(no_cookie: Bool, aspect_ratio: Option(String))
}

pub type VimeoConfig {
  VimeoConfig(dnt: Bool, aspect_ratio: Option(String))
}

pub type SpotifyConfig {
  SpotifyConfig(
    width: Option(Int),
    height: Option(Int),
    track_height: Option(Int),
  )
}

pub type TwitterConfig {
  TwitterConfig
}

pub type TikTokConfig {
  TikTokConfig
}

pub type BlueskyConfig {
  BlueskyConfig(resolve_handle: Option(fn(String) -> Result(String, Nil)))
}

pub type InstagramConfig {
  InstagramConfig
}

pub type TwitchConfig {
  TwitchConfig(parent: String, aspect_ratio: Option(String))
}

pub type OpenStreetMapConfig {
  OpenStreetMapConfig(aspect_ratio: Option(String))
}

pub type TedConfig {
  TedConfig(aspect_ratio: Option(String))
}

pub type SoundCloudConfig {
  SoundCloudConfig(width: Option(Int), height: Option(Int))
}

pub type MastodonConfig {
  MastodonConfig(servers: List(String), width: Option(Int))
}

pub type PixelfedConfig {
  PixelfedConfig(
    servers: List(String),
    layout: PixelfedLayout,
    width: Option(Int),
  )
}

pub type AppleMusicConfig {
  AppleMusicConfig(
    width: Option(Int),
    height: Option(Int),
    song_height: Option(Int),
  )
}

pub fn bluesky_config() -> BlueskyConfig {
  BlueskyConfig(resolve_handle: None)
}

pub fn default_config() -> Config {
  Config(
    youtube: Some(YoutubeConfig(no_cookie: True, aspect_ratio: None)),
    vimeo: Some(VimeoConfig(dnt: True, aspect_ratio: None)),
    spotify: Some(SpotifyConfig(width: None, height: None, track_height: None)),
    twitter: Some(TwitterConfig),
    tiktok: Some(TikTokConfig),
    bluesky: Some(BlueskyConfig(resolve_handle: None)),
    instagram: Some(InstagramConfig),
    twitch: None,
    openstreetmap: Some(OpenStreetMapConfig(aspect_ratio: None)),
    ted: Some(TedConfig(aspect_ratio: None)),
    soundcloud: Some(SoundCloudConfig(width: None, height: None)),
    mastodon: None,
    pixelfed: None,
    apple_music: Some(AppleMusicConfig(
      width: None,
      height: None,
      song_height: None,
    )),
  )
}

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
