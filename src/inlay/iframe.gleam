import lustre/attribute.{type Attribute}
import lustre/element.{type Element}
import lustre/element/html

pub fn responsive(
  src: String,
  aspect_ratio: String,
  attrs: List(Attribute(msg)),
) -> Element(msg) {
  html.div(
    [
      attribute.styles([
        #("position", "relative"),
        #("padding-bottom", aspect_ratio),
        #("height", "0"),
        #("overflow", "hidden"),
      ]),
    ],
    [
      html.iframe([
        attribute.src(src),
        attribute.styles([
          #("position", "absolute"),
          #("top", "0"),
          #("left", "0"),
          #("width", "100%"),
          #("height", "100%"),
        ]),
        attribute.attribute("frameborder", "0"),
        ..attrs
      ]),
    ],
  )
}
