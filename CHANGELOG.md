# CHANGELOG

## 2016-11-26 v0.3.0
- Rewrote proxy engine using `Object.defineProperty`
- This is a breaking change; please refer to `README` for the recent uesage... but I'll briefly explain what changed here:
  - `options.transclude` is no longer `true` by default
  - `subscriber`'s second argument does no longer only look for `dispatch` in the props given; it'll give you the entire `props` so you can post-process your persistent state anyway you please.
