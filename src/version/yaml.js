const objectPath = require('object-path')
const yaml = require('yaml')
const core = require('@actions/core')

const BaseVersioning = require('./base')
const bumpVersion = require('../helpers/bumpVersion')

module.exports = new (class Yaml extends BaseVersioning{

  /**
   * Bumps the version in the package.json
   *
   * @param {!string} releaseType - The type of release
   * @return {*}
   */
  bump = (releaseType) => {
    // Read the file
    const fileContent = this.read()
    const yamlContent = yaml.parse(fileContent) || {}
    const oldVersion = objectPath.get(yamlContent, this.versionPath, null)

    // Get the new version
    this.newVersion = bumpVersion(
      releaseType,
      oldVersion,
    )
    core.info('Bumped version (NO version regex): ' + this.newVersion)
    
    this.versionFinal = this.newVersion

    // use version regex to modify the version as specified
    const versionRegex = core.getInput('version-regex')
    if(versionRegex){
      // Use the regex to edit the old version
      this.newVersionRegex = versionRegex.replace("<version>", oldVersion)
      core.info('Used version regex: ' + this.newVersionRegex)

      this.versionFinal = this.newVersionRegex
    }
    

    // Update the file
    if (oldVersion) {
      // Get the name of where the version is in
      const versionName = this.versionPath.split('.').pop()

      this.update(
        // We use replace instead of yaml.stringify so we can preserve white spaces and comments
        fileContent.replace(
          `${versionName}: ${oldVersion}`,
          `${versionName}: ${this.newVersionFinal}`,
        ),
      )
    } else {
      // Update the content with the new version
      objectPath.set(yamlContent, this.versionPath, this.newVersionFinal)
      this.update(yaml.stringify(yamlContent))
    }
  }

})

