# bangladesh-geojson — vendored data

The four JSON files in this directory are **copies** of files from
[`ifahimreza/bangladesh-geojson`](https://github.com/ifahimreza/bangladesh-geojson),
taken verbatim (byte-identical, not reformatted) at commit:

```
4723ee5f9fecaa79af6266a746cf89c39841a02d
```

That is the commit the project previously resolved
`"bangladesh-geojson": "github:ifahimreza/bangladesh-geojson"` to in
`package-lock.json`. The dependency was removed in P1.6.5 and the data moved here.

## Why vendored

The dependency was declared as a bare `github:` specifier — a personal fork, resolved
over `git+ssh` in the lockfile, and therefore outside the registry audit entirely: no
`npm audit` coverage, no proxy/cache, and an install that requires GitHub SSH access.
The data itself is ~109 KB of static JSON that changes only if the upstream dataset
does. Copying it in makes install reproducible without that dependency.

## What each file is

| Vendored file | Upstream path | Contents |
| --- | --- | --- |
| `bd-divisions.json` | `src/data/bd-divisions.json` | 8 divisions |
| `bd-districts.json` | `src/data/bd-districts.json` | 64 districts, each with `division_id` |
| `bd-upazilas.json` | `src/data/bd-upazilas.json` | upazilas, each with `district_id` |
| `dhaka-city.json` | `src/data/dhaka-city.json` | Dhaka city areas, with `division_id` / `district_id` |

`bd-postcodes.json` (183 KB) and the boundary/routes GeoJSON are **not** vendored —
nothing in this repository used them.

Consumer: `src/constants/bangladesh-locations.ts`.

## Licence — the data is ODbL, NOT MIT

This is the part that is easy to get wrong. The package's `package.json` declares
`"license": "MIT"`, and that applies to its **code**. The **data** is licensed under
the [ODC Open Database License (ODbL) 1.0](./LICENSE-DATA) — see
`LICENSE-DATA` in this directory, reproduced from upstream. `LICENSE` (MIT) is
included as well because it covers the upstream code the file layout came from.

Practical consequences of the ODbL for this repository:

- **Attribution is required.** This file is that attribution, and it ships with the
  data. Keep it if the files are moved again.
- **Share-alike applies to a derived *database*, not to the application.** Shipping
  these files inside a Next.js app does not make the app ODbL. Modifying the data or
  combining it into a public database does trigger the ODbL terms for that database.

## Updating

1. Take the new commit hash from upstream and copy all four files verbatim.
2. Update the hash above and re-check the row counts with
   `npm run verify:locations-data` (it asserts 8 / 64 / non-empty / non-empty).
3. **Re-check `src/shipping/bangladesh-locations.ts` in the backend** — it holds the
   division/district/area lists that `resolveShippingZone` validates against, and it
   was generated from this same dataset. An upstream change to names or IDs silently
   desynchronises the two, and the shipping policy then rejects addresses the
   storefront offers. That coupling is the real hazard of this data.
