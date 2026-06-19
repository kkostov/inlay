//// Provider dispatch shared by the public `inlay` API and the Lustre component.
////
//// `detect_with` walks the enabled providers to turn a URL into an `Embed`, and
//// `render_with` turns a detected `Embed` back into HTML. Both honour the
//// supplied `Config`.

import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/apple_music
import inlay/bluesky
import inlay/embed.{
  type Config, type Embed, AppleMusicMedia, BlueskyPost, InstagramPost,
  MapLocation, MastodonPost, PixelfedPost, SoundCloudTrack, SpotifyMedia,
  TedTalk, TikTokVideo, Tweet, TwitchChannel, TwitchVideo, VimeoVideo,
  YoutubePlaylist, YoutubeVideo,
}
import inlay/inline
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
import lustre/element.{type Element}

/// Detect an embeddable link from a URL using the given configuration.
pub fn detect_with(url: String, config: Config) -> Option(Embed) {
  case uri.parse(url) {
    Ok(parsed) -> do_detect(parsed, config)
    Error(_) -> None
  }
}

/// Render a detected embed as HTML using the given configuration.
pub fn render_with(embed: Embed, config: Config) -> Element(msg) {
  let assert Ok(el) = case embed {
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
  el
}

/// Render a detected embed for the Lustre component path. Providers that scan
/// the host page with a script render nothing or clip inside a component's
/// shadow root, so this renders them as self-contained iframes; every other
/// provider falls back to [`render_with`](#render_with). Bluesky is handled by
/// the component itself because it depends on the resolved DID.
pub fn render_inline_with(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    Tweet(_handle, id) -> inline.tweet_iframe(id, tweet_height(config))
    InstagramPost(post_type, id) ->
      inline.instagram_iframe(post_type, id, instagram_height(config))
    TikTokVideo(_username, id) ->
      inline.tiktok_iframe(id, tiktok_height(config))
    MastodonPost(server, user, id) ->
      inline.mastodon_iframe(server, user, id, mastodon_height(config))
    PixelfedPost(server, user, id) ->
      inline.pixelfed_iframe(server, user, id, pixelfed_height(config))
    YoutubeVideo(..)
    | YoutubePlaylist(..)
    | VimeoVideo(..)
    | SpotifyMedia(..)
    | BlueskyPost(..)
    | TwitchChannel(..)
    | TwitchVideo(..)
    | MapLocation(..)
    | TedTalk(..)
    | SoundCloudTrack(..)
    | AppleMusicMedia(..) -> render_with(embed, config)
  }
}

/// The initial component-path height for a Bluesky embed, from `config` with a
/// default of `600`.
pub fn bluesky_height(config: Config) -> Int {
  case config.bluesky {
    Some(embed.BlueskyConfig(height:, ..)) -> option.unwrap(height, 600)
    None -> 600
  }
}

fn tweet_height(config: Config) -> Int {
  case config.twitter {
    Some(embed.TwitterConfig(height:)) -> option.unwrap(height, 550)
    None -> 550
  }
}

fn instagram_height(config: Config) -> Int {
  case config.instagram {
    Some(embed.InstagramConfig(height:)) -> option.unwrap(height, 700)
    None -> 700
  }
}

fn tiktok_height(config: Config) -> Int {
  case config.tiktok {
    Some(embed.TikTokConfig(height:)) -> option.unwrap(height, 750)
    None -> 750
  }
}

fn mastodon_height(config: Config) -> Int {
  case config.mastodon {
    Some(embed.MastodonConfig(height:, ..)) -> option.unwrap(height, 400)
    None -> 400
  }
}

fn pixelfed_height(config: Config) -> Int {
  case config.pixelfed {
    Some(embed.PixelfedConfig(height:, ..)) -> option.unwrap(height, 600)
    None -> 600
  }
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
