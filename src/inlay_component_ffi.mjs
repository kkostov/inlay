// Resizes self-contained embed iframes inside the `<inlay-embed>` component's
// shadow root in response to the height messages each provider's embed page
// posts to its parent window. The matching iframe is found by comparing the
// message source against each iframe's content window, so the listener works
// regardless of how many embeds share the page.

const FRAME_SELECTOR = "iframe.inlay-embed-frame";

const installed = new WeakSet();

export function install_resize_listener(root) {
  if (!root || installed.has(root)) {
    return;
  }
  installed.add(root);

  window.addEventListener("message", (event) => {
    const height = height_from_message(event.data);
    if (height === undefined) {
      return;
    }
    const frame = frame_for_source(root, event.source);
    if (frame) {
      frame.style.height = `${height}px`;
    }
  });
}

function frame_for_source(root, source) {
  if (!source) {
    return undefined;
  }
  const frames = root.querySelectorAll(FRAME_SELECTOR);
  for (const frame of frames) {
    if (frame.contentWindow === source) {
      return frame;
    }
  }
  return undefined;
}

// Extracts a pixel height from the message shapes used by the embed providers
// this component renders as iframes:
//   - Bluesky:   { height }
//   - Mastodon:  { type: "setHeight", height }   (Pixelfed shares this)
//   - Instagram: { type: "MEASURE", details: { height } }
//   - TikTok:    { height, width }
//   - Twitter:   { "twttr.embed": { method: "twttr.private.resize", params: [{ height }] } }
function height_from_message(data) {
  const parsed = parse(data);
  if (!parsed || typeof parsed !== "object") {
    return undefined;
  }

  if (parsed.type === "MEASURE" && parsed.details) {
    return to_number(parsed.details.height);
  }

  const twitter = parsed["twttr.embed"];
  if (
    twitter &&
    twitter.method === "twttr.private.resize" &&
    Array.isArray(twitter.params) &&
    twitter.params[0]
  ) {
    return to_number(twitter.params[0].height);
  }

  return to_number(parsed.height);
}

function parse(data) {
  if (typeof data === "string") {
    if (data[0] !== "{") {
      return undefined;
    }
    try {
      return JSON.parse(data);
    } catch (_error) {
      return undefined;
    }
  }
  return data;
}

function to_number(value) {
  const height = Number(value);
  if (Number.isFinite(height) && height > 0) {
    return height;
  }
  return undefined;
}
