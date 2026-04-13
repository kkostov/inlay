import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{
  type Config, type Embed, AppleMusicMedia, BlueskyPost, InstagramPost,
  MapLocation, MastodonPost, PixelfedPost, SoundCloudTrack, SpotifyMedia,
  TedTalk, TikTokVideo, Tweet, TwitchChannel, TwitchVideo, VimeoVideo,
  YoutubePlaylist, YoutubeVideo,
}
import inlay/provider/apple_music
import inlay/provider/bluesky
import inlay/provider/instagram
import inlay/provider/mastodon
import inlay/provider/openstreetmap
import inlay/provider/pixelfed
import inlay/provider/soundcloud
import inlay/provider/spotify
import inlay/provider/ted
import inlay/provider/tiktok
import inlay/provider/twitch
import inlay/provider/twitter
import inlay/provider/vimeo
import inlay/provider/youtube
import lustre/element.{type Element}

pub fn detect(url: Uri, config: Config) -> Option(Embed) {
  use <- try_one(config.mastodon, url, fn(u) { mastodon.detect(u, config) })
  use <- try_one(config.pixelfed, url, fn(u) { pixelfed.detect(u, config) })
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

pub fn render(embed: Embed, config: Config) -> Element(msg) {
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
