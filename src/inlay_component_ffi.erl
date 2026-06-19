-module(inlay_component_ffi).
-export([install_resize_listener/1]).

%% The resize listener is browser-only; on the Erlang target it does nothing.
install_resize_listener(_Root) ->
    nil.
