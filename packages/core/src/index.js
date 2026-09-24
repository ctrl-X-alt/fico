const { analyzeFunnel } = require("./funnel");
const { runDiagnostic } = require("./diagnosticPipeline");
const { validateAnalysisInput } = require("./validator");
module.exports = { analyzeFunnel, runDiagnostic, validateAnalysisInput };