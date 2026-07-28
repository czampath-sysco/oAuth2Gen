module.exports = {
  hooks: {
    readPackage(pkg) {
      // Disable all build scripts for security
      delete pkg.scripts?.preinstall;
      delete pkg.scripts?.install;
      delete pkg.scripts?.postinstall;
      delete pkg.scripts?.preprepare;
      delete pkg.scripts?.prepare;
      delete pkg.scripts?.postprepare;
      return pkg;
    },
  },
};
