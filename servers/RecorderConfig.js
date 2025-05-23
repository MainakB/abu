export class RecorderConfig {
  constructor({
    selectedSrcFolder,
    featureFile,
    locatorFile,
    featureName = "Recorded Test Feature",
    scenarioName = "Recorded Test Scenario",
    tagName = "@recordedTest",
    basePath,
    debug,
  }) {
    this.selectedSrcFolder = selectedSrcFolder;
    this.featureFile = featureFile;
    this.locatorFile = locatorFile;
    this.featureName = featureName;
    this.scenarioName = scenarioName;
    this.tagName = tagName;
    this.basePath = basePath;
    this.debug = debug;
  }

  get fullFeaturePath() {
    return `${this.selectedSrcFolder}/${this.featureFile}`;
  }

  get fullLocatorPath() {
    return `${this.selectedSrcFolder}/${this.locatorFile}`;
  }

  toJSON() {
    return {
      selectedSrcFolder: this.selectedSrcFolder,
      featureFile: this.featureFile,
      locatorFile: this.locatorFile,
      featureName: this.featureName,
      scenarioName: this.scenarioName,
      tagName: this.tagName,
      basePath: this.basePath,
      debug: this.debug,
    };
  }
}
