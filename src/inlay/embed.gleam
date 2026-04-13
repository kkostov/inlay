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

pub fn youtube_config() -> YoutubeConfig {
  YoutubeConfig(no_cookie: True, aspect_ratio: None)
}

pub fn vimeo_config() -> VimeoConfig {
  VimeoConfig(dnt: True, aspect_ratio: None)
}

pub fn spotify_config() -> SpotifyConfig {
  SpotifyConfig(width: None, height: None, track_height: None)
}

pub fn twitch_config(parent: String) -> TwitchConfig {
  TwitchConfig(parent: parent, aspect_ratio: None)
}

pub fn openstreetmap_config() -> OpenStreetMapConfig {
  OpenStreetMapConfig(aspect_ratio: None)
}

pub fn ted_config() -> TedConfig {
  TedConfig(aspect_ratio: None)
}

pub fn soundcloud_config() -> SoundCloudConfig {
  SoundCloudConfig(width: None, height: None)
}

pub fn mastodon_config(servers: List(String)) -> MastodonConfig {
  MastodonConfig(servers: servers, width: None)
}

pub fn pixelfed_config(
  servers: List(String),
  layout: PixelfedLayout,
) -> PixelfedConfig {
  PixelfedConfig(servers: servers, layout: layout, width: None)
}

pub fn apple_music_config() -> AppleMusicConfig {
  AppleMusicConfig(width: None, height: None, song_height: None)
}

pub fn default_config() -> Config {
  Config(
    youtube: Some(youtube_config()),
    vimeo: Some(vimeo_config()),
    spotify: Some(spotify_config()),
    twitter: Some(TwitterConfig),
    tiktok: Some(TikTokConfig),
    bluesky: Some(bluesky_config()),
    instagram: Some(InstagramConfig),
    twitch: None,
    openstreetmap: Some(openstreetmap_config()),
    ted: Some(ted_config()),
    soundcloud: Some(soundcloud_config()),
    mastodon: None,
    pixelfed: None,
    apple_music: Some(apple_music_config()),
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
