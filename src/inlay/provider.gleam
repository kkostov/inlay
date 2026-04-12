import gleam/option.{type Option, None, Some}
import gleam/uri.{type Uri}
import inlay/embed.{
  type Config, type Embed, BlueskyPost, InstagramPost, MapLocation, MastodonPost,
  SoundCloudTrack, SpotifyMedia, TedTalk, TikTokVideo, Tweet, TwitchChannel,
  TwitchVideo, VimeoVideo, YouTubePlaylist, YouTubeVideo,
}
import inlay/provider/bluesky
import inlay/provider/instagram
import inlay/provider/mastodon
import inlay/provider/openstreetmap
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
  use <- try_one(url, youtube.detect)
  use <- try_one(url, ted.detect)
  use <- try_one(url, vimeo.detect)
  use <- try_one(url, spotify.detect)
  use <- try_one(url, bluesky.detect)
  use <- try_one(url, twitch.detect)
  use <- try_one(url, soundcloud.detect)
  use <- try_one(url, twitter.detect)
  use <- try_one(url, tiktok.detect)
  use <- try_one(url, instagram.detect)
  use <- try_one(url, openstreetmap.detect)
  case mastodon.detect(url, config) {
    Some(found) -> Some(found)
    None -> None
  }
}

pub fn render(embed: Embed, config: Config) -> Element(msg) {
  case embed {
    YouTubeVideo(..) | YouTubePlaylist(..) -> youtube.render(embed, config)
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
  }
}

fn try_one(
  url: Uri,
  detector: fn(Uri) -> Option(Embed),
  next: fn() -> Option(Embed),
) -> Option(Embed) {
  case detector(url) {
    Some(found) -> Some(found)
    None -> next()
  }
}
