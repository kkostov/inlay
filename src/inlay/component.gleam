//// A single universal Lustre component for every inlay provider.
////
//// Register one custom element, `<inlay-embed url="…">`, that auto-detects the
//// provider from its `url` attribute and renders the matching embed. Configure
//// it imperatively with [`configure`](#configure) (or [`register`](#register)
//// for the default configuration) from a browser `main`, then use the tag in
//// your markup or the [`embed_element`](#embed_element) helper in a Lustre view.
////
//// Registration only takes effect in the browser; on other targets `register`
//// returns `lustre.NotABrowser` and [`embed_element`](#embed_element) still
//// serialises to the plain custom-element tag.

import gleam/dynamic.{type Dynamic}
import gleam/option.{type Option, None, Some}
import inlay/bluesky
import inlay/detect
import inlay/embed.{type Config, BlueskyPost}
import inlay/inline
import lustre.{type App}
import lustre/attribute.{type Attribute}
import lustre/component
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import rsvp

/// The custom element tag for the universal embed component.
pub const name = "inlay-embed"

/// The decoded attributes of an `<inlay-embed>` element together with the state
/// of any in-flight Bluesky handle resolution. The base [`Config`](./embed.html#Config)
/// is captured in the component closure, not stored here.
pub type Model {
  Model(
    url: Option(String),
    no_cookie: Option(Bool),
    parent: Option(String),
    aspect_ratio: Option(String),
    state: Resolution,
  )
}

/// State of the handle-to-DID resolution for a Bluesky embed.
pub type Resolution {
  Static
  Resolving
  Resolved(did: String)
  Failed
}

/// A change to one of an `<inlay-embed>` element's attributes, or the result of
/// a Bluesky handle resolution.
pub type Msg {
  UrlChanged(url: String)
  NoCookieChanged(no_cookie: Bool)
  ParentChanged(parent: String)
  AspectRatioChanged(aspect_ratio: String)
  GotDid(result: Result(String, rsvp.Error(String)))
}

/// Initialise the component model before any attribute has been received.
pub fn init(_args: Nil) -> #(Model, Effect(Msg)) {
  #(
    Model(
      url: None,
      no_cookie: None,
      parent: None,
      aspect_ratio: None,
      state: Static,
    ),
    install_resize_listener_effect(),
  )
}

/// Install the embed resize listener on the component's shadow root once it has
/// been painted. The listener resizes self-contained embed iframes from the
/// provider height messages. It is browser-only; on other targets `after_paint`
/// effects never run.
fn install_resize_listener_effect() -> Effect(Msg) {
  effect.after_paint(fn(_dispatch, root) { install_resize_listener(root) })
}

@external(erlang, "inlay_component_ffi", "install_resize_listener")
@external(javascript, "../inlay_component_ffi.mjs", "install_resize_listener")
fn install_resize_listener(root: Dynamic) -> Nil

/// Advance the component model in response to a message, using `config` as the
/// base configuration before per-embed overrides are applied.
pub fn update(config: Config, model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    UrlChanged(url) -> {
      let model = Model(..model, url: Some(url))
      case detect.detect_with(url, effective_config(config, model)) {
        Some(BlueskyPost(handle, _)) ->
          case bluesky.needs_resolution(handle) {
            True -> #(
              Model(..model, state: Resolving),
              bluesky.resolve_effect(handle, GotDid),
            )
            False -> #(Model(..model, state: Static), effect.none())
          }
        _ -> #(Model(..model, state: Static), effect.none())
      }
    }
    NoCookieChanged(no_cookie) -> #(
      Model(..model, no_cookie: Some(no_cookie), state: Static),
      effect.none(),
    )
    ParentChanged(parent) -> #(
      Model(..model, parent: Some(parent), state: Static),
      effect.none(),
    )
    AspectRatioChanged(aspect_ratio) -> #(
      Model(..model, aspect_ratio: Some(aspect_ratio), state: Static),
      effect.none(),
    )
    GotDid(Ok(did)) -> #(Model(..model, state: Resolved(did)), effect.none())
    GotDid(Error(_)) -> #(Model(..model, state: Failed), effect.none())
  }
}

/// Render the current component model to HTML, using `config` as the base
/// configuration before per-embed overrides are applied.
pub fn view(config: Config, model: Model) -> Element(msg) {
  let config = effective_config(config, model)
  case model.url {
    None -> element.none()
    Some(url) ->
      case detect.detect_with(url, config) {
        Some(BlueskyPost(handle, rkey)) ->
          case model.state {
            Resolved(did) -> inline.bluesky_iframe(did, rkey)
            Resolving | Failed -> bluesky.fallback_view(handle, rkey)
            Static -> bluesky_static_view(handle, rkey)
          }
        Some(found) -> detect.render_inline_with(found, config)
        None -> link(url)
      }
  }
}

fn link(url: String) -> Element(msg) {
  html.a([attribute.href(url)], [element.text(url)])
}

/// Render a Bluesky post that needs no handle resolution. A handle already in
/// `did:` form is itself the DID, so the embed iframe renders directly;
/// anything else falls back to a link.
fn bluesky_static_view(handle: String, rkey: String) -> Element(msg) {
  case bluesky.needs_resolution(handle) {
    False -> inline.bluesky_iframe(handle, rkey)
    True -> bluesky.fallback_view(handle, rkey)
  }
}

/// Layer this element's per-embed overrides onto the captured base config. Only
/// the providers whose rendering can be tuned per embed are affected.
fn effective_config(config: Config, model: Model) -> Config {
  let youtube = case config.youtube {
    Some(youtube) ->
      Some(embed.YoutubeConfig(
        no_cookie: optional(model.no_cookie, youtube.no_cookie),
        aspect_ratio: prefer(model.aspect_ratio, youtube.aspect_ratio),
      ))
    None -> None
  }
  let twitch = case model.parent {
    Some(parent) -> Some(embed.twitch_config(parent))
    None -> config.twitch
  }
  embed.Config(..config, youtube:, twitch:)
}

fn optional(override: Option(a), fallback: a) -> a {
  case override {
    Some(value) -> value
    None -> fallback
  }
}

fn prefer(override: Option(a), fallback: Option(a)) -> Option(a) {
  case override {
    Some(_) -> override
    None -> fallback
  }
}

/// The `<inlay-embed>` component configured with the given base config.
///
/// The config is captured in the component's `update`/`view` closures. Pass it
/// to [`lustre.register`](https://hexdocs.pm/lustre/lustre.html#register) (see
/// [`configure`](#configure)) or run it as a server component.
pub fn embed_component(config: Config) -> App(Nil, Model, Msg) {
  lustre.component(
    init,
    fn(model, msg) { update(config, model, msg) },
    fn(model) { view(config, model) },
    [
      component.on_attribute_change("url", fn(value) { Ok(UrlChanged(value)) }),
      component.on_attribute_change("no-cookie", fn(value) {
        Ok(NoCookieChanged(value != "false"))
      }),
      component.on_attribute_change("parent", fn(value) {
        Ok(ParentChanged(value))
      }),
      component.on_attribute_change("aspect-ratio", fn(value) {
        Ok(AspectRatioChanged(value))
      }),
      component.open_shadow_root(True),
    ],
  )
}

/// Register `<inlay-embed>` with the given base configuration. Call this once
/// from a browser `main` before rendering any `<inlay-embed>` tags.
///
/// Registration is browser-only; on other targets it returns
/// `lustre.NotABrowser`. Calling it more than once yields
/// `lustre.ComponentAlreadyRegistered`.
pub fn configure(config: Config) -> Result(Nil, lustre.Error) {
  lustre.register(embed_component(config), name)
}

/// Register `<inlay-embed>` with the default configuration.
pub fn register() -> Result(Nil, lustre.Error) {
  configure(embed.default_config())
}

/// Render the `<inlay-embed>` custom-element tag with the given attributes.
pub fn embed_element(attributes: List(Attribute(msg))) -> Element(msg) {
  element.element(name, attributes, [])
}
