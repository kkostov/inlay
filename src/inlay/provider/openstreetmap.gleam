import gleam/float
import gleam/int
import gleam/option.{type Option, None, Some}
import gleam/string
import gleam/uri.{type Uri}
import inlay/embed.{type Config, type Embed, MapLocation}
import inlay/iframe
import lustre/element.{type Element}

pub fn detect(url: Uri) -> Option(Embed) {
  case url.host {
    Some("openstreetmap.org") | Some("www.openstreetmap.org") -> detect_osm(url)
    _ -> None
  }
}

pub fn render(embed: Embed, _config: Config) -> Element(msg) {
  case embed {
    MapLocation(zoom, lat, long) -> {
      let bbox = bounding_box(lat, long, zoom)
      let src =
        "https://www.openstreetmap.org/export/embed.html?bbox="
        <> float.to_string(bbox.min_long)
        <> "%2C"
        <> float.to_string(bbox.min_lat)
        <> "%2C"
        <> float.to_string(bbox.max_long)
        <> "%2C"
        <> float.to_string(bbox.max_lat)
        <> "&layer=mapnik&marker="
        <> float.to_string(lat)
        <> "%2C"
        <> float.to_string(long)
      iframe.responsive(src, "75%", [])
    }
    _ -> panic as "unreachable"
  }
}

type BoundingBox {
  BoundingBox(min_lat: Float, min_long: Float, max_lat: Float, max_long: Float)
}

fn bounding_box(lat: Float, long: Float, zoom: Int) -> BoundingBox {
  let offset = 360.0 /. pow(2.0, int.to_float(zoom))
  let lat_offset = offset /. cos_deg(lat)
  BoundingBox(
    min_lat: lat -. lat_offset,
    min_long: long -. offset,
    max_lat: lat +. lat_offset,
    max_long: long +. offset,
  )
}

fn cos_deg(degrees: Float) -> Float {
  let radians = degrees *. 3.141592653589793 /. 180.0
  cos(radians)
}

@external(erlang, "math", "cos")
@external(javascript, "../../inlay_ffi.mjs", "cos")
fn cos(radians: Float) -> Float

@external(erlang, "math", "pow")
@external(javascript, "../../inlay_ffi.mjs", "pow")
fn pow(base: Float, exponent: Float) -> Float

fn detect_osm(url: Uri) -> Option(Embed) {
  case url.fragment {
    Some(fragment) -> parse_map_fragment(fragment)
    None -> None
  }
}

fn parse_map_fragment(fragment: String) -> Option(Embed) {
  case string.split(fragment, "=") {
    ["map", rest] -> parse_map_coords(rest)
    _ -> None
  }
}

fn parse_map_coords(coords: String) -> Option(Embed) {
  case string.split(coords, "/") {
    [zoom_str, lat_str, long_str] ->
      case int.parse(zoom_str), float.parse(lat_str), float.parse(long_str) {
        Ok(zoom), Ok(lat), Ok(long) -> Some(MapLocation(zoom, lat, long))
        _, _, _ -> None
      }
    _ -> None
  }
}
