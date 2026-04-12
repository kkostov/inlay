import gleam/option.{None, Some}
import gleam/string
import gleam/uri
import inlay/embed.{MapLocation}
import inlay/provider/openstreetmap
import lustre/element

pub fn brussels_atomium_test() {
  let assert Ok(url) =
    uri.parse(
      "https://www.openstreetmap.org/relation/19189218#map=17/50.8949/4.3416",
    )
  let assert Some(MapLocation(17, lat, long)) = openstreetmap.detect(url)
  let assert True = float_close(lat, 50.8949)
  let assert True = float_close(long, 4.3416)
}

pub fn osm_without_www_test() {
  let assert Ok(url) =
    uri.parse("https://openstreetmap.org/way/123#map=15/48.8584/2.2945")
  let assert Some(MapLocation(15, _, _)) = openstreetmap.detect(url)
}

pub fn osm_without_fragment_returns_none_test() {
  let assert Ok(url) =
    uri.parse("https://www.openstreetmap.org/relation/19189218")
  let assert None = openstreetmap.detect(url)
}

pub fn non_osm_url_returns_none_test() {
  let assert Ok(url) = uri.parse("https://example.com/#map=17/50.8949/4.3416")
  let assert None = openstreetmap.detect(url)
}

pub fn render_brussels_atomium_test() {
  let e = MapLocation(17, 50.8949, 4.3416)
  let html = element.to_string(openstreetmap.render(e, embed.default_config()))
  let assert True = string.contains(html, "openstreetmap.org/export/embed.html")
  let assert True = string.contains(html, "bbox=")
  let assert True = string.contains(html, "marker=")
}

fn float_close(a: Float, b: Float) -> Bool {
  let diff = case a -. b {
    d if d <. 0.0 -> 0.0 -. d
    d -> d
  }
  diff <. 0.0001
}
