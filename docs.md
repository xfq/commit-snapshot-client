# Category of repos/specs

Note: one repo sometimes belongs to multiple categories.

## Bikeshed

* Normal Bikeshed spec with both `.bs` and `.html` in the default branch
* Bikeshed spec that contains only `.bs` file in `master`, and deploys the generated spec to `gh-pages` (example: Indexed DB)
* A repository containing multiple Bikeshed specs (example: Service Worker)
* Bikeshed spec that does not use GitHub Pages (example: CSS)

## ReSpec

* Normal ReSpec spec
* A repository containing multiple ReSpec specs
* ReSpec spec that deploys the generated spec (using [Spec Generator](https://github.com/w3c/spec-generator)) to `gh-pages` (example: WAI-ARIA)

# Supported GitHub orgs

* [w3c](https://github.com/w3c)
* [WICG](https://github.com/WICG)

Considering:

* [w3ctag](https://github.com/w3ctag)
* [immersive-web](https://github.com/immersive-web)
* [WebBluetoothCG](https://github.com/WebBluetoothCG)

# Things to do

* Add a feature to Bikeshed/ReSpec that can provide the URL of the current version of the spec
* Make a browser extension or bookmarklet
