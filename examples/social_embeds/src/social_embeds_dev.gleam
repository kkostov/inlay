import blogatto/dev
import blogatto/error
import gleam/io
import social_embeds

pub fn main() {
  case
    social_embeds.config()
    |> dev.new()
    |> dev.build_command("gleam run -m social_embeds")
    |> dev.port(3000)
    |> dev.start()
  {
    Ok(Nil) -> io.println("Dev server stopped.")
    Error(err) -> io.println("Dev server error: " <> error.describe_error(err))
  }
}
