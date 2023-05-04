# Get Release Asset Action

Get a release asset from any repository

## Example usage

```yml
steps:
  - uses: rileran/get-release-asset-action@v1
    id: ts-asset
    with:
      repository: microsoft/TypeScript
      asset: 'typescript.*tgz'
      github_token: ${{ secrets.GITHUB_TOKEN }}
  - run: tar -tvf ${{ steps.ts-asset.outputs.asset_path }}
```

## Development

### Installation

You need node 16.

```bash
$ npm install
```

### Test

Run the tests :heavy_check_mark:

```bash
$ npm test
```

### Package

Build the typescript and package it for distribution

```bash
$ npm run build && npm run package
```

### Publish

Actions are run from GitHub repos so we will checkin the packed dist folder.

Then run [ncc](https://github.com/zeit/ncc) and push the results:

```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Then create a tag/release on github.
