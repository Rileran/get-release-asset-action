import {appendFileSync} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const [owner, repo] = core
      .getInput('repository', {required: true})
      .split('/')
    const assetPattern = core.getInput('asset', {required: true})
    const release_id = core.getInput('release_id')
    const token = core.getInput('github_token')

    core.info(`Repository: ${owner}/${repo}`)
    core.info(`Release_id: ${release_id !== '' ? release_id : 'latest'}`)
    core.info(`Asset: ${assetPattern}`)

    const client = github.getOctokit(token)

    const release = await (release_id !== ''
      ? client.rest.repos.getRelease({
          owner,
          repo,
          release_id: parseInt(release_id)
        })
      : client.rest.repos.getLatestRelease({owner, repo}))

    core.info(
      `Found release ${release.data.name ?? ''} with id ${release.data.id} @ ${
        release.data.published_at
      }`
    )
    core.info(`Release url: ${release.data.url}`)
    core.info(`Found assets: ${release.data.assets.map(asset => asset.name)}`)

    const assetRegExp = new RegExp(assetPattern)
    const matchedAsset = release.data.assets.find(asset =>
      asset.name.match(assetRegExp)
    )

    if (!matchedAsset) {
      throw new Error(`Could not find asset for pattern ${assetPattern}`)
    }

    core.info(
      `Asset matched: ${matchedAsset.name} (${matchedAsset.size} bytes)`
    )

    core.info(`Downloading asset ${matchedAsset.name}`)
    const binaryAsset = await client.rest.repos.getReleaseAsset({
      owner,
      repo,
      asset_id: matchedAsset.id,
      headers: {accept: 'application/octet-stream'}
    })

    core.info(`Writing asset onto the filesystem ${matchedAsset.name}`)
    // from https://github.com/containers/podman-desktop/blob/main/extensions/podman/scripts/download.ts
    appendFileSync(
      matchedAsset.name,
      Buffer.from(binaryAsset.data as unknown as ArrayBuffer)
    )

    core.setOutput('asset_path', matchedAsset.name)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
