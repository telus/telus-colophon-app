workflow "Build, test, lint, release" {
  resolves = [
    "Execute `npm run lint`",
    "Executes `npm run release`",
  ]
  on = "push"
}

action "Execute `npm ci`" {
  uses = "actions/npm@master"
  args = "ci"
}

action "Execute `npm run lint`" {
  needs = ["Execute `npm ci`"]
  uses = "actions/npm@master"
  args = "run lint"
}

action "Executes `npm run test`" {
  needs = ["Execute `npm ci`"]
  uses = "actions/npm@master"
  args = "run test"
}

action "Executes `npm run release:dryrun`" {
  uses = "actions/npm@master"
  needs = ["Executes `npm run test`", "Execute `npm run lint`"]
  secrets = ["GITHUB_TOKEN", "NPM_TOKEN"]
  args = "run release:dryrun"
}

action "Releases only if pushed to master branch" {
  uses = "actions/bin/filter@master"
  args = "branch master"
  needs = ["Executes `npm run release:dryrun`"]
}

action "Executes `npm run release`" {
  uses = "actions/npm@master"
  needs = ["Releases only if pushed to master branch"]
  args = "run release"
  secrets = ["GITHUB_TOKEN", "NPM_TOKEN"]
}
