const {buildReportHtml}=require("@fico/core");
let chromiumPromise;
function getChromium(){if(!chromiumPromise)chromiumPromise=(async()=>{const{chromium}=require("playwright");return chromium})();return chromiumPromise}
async function renderReport(analysis){if(!analysis?.result)throw Object.assign(new Error("report_requires_completed_analysis"),{code:"report_requires_completed_analysis"});return buildReportHtml(analysis)}
async function renderPdf(analysis){const html=await renderReport(analysis);const chromium=await getChromium();const browser=await chromium.launch({headless:true});try{const page=await browser.newPage({viewport:{width:1240,height:1754}});await page.setContent(html,{waitUntil:"domcontentloaded",timeout:Number(process.env.PDF_PAGE_TIMEOUT_MS||20000)});return await page.pdf({format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"18mm",right:"16mm",bottom:"18mm",left:"16mm"}})}finally{await browser.close()}}
module.exports={renderReport,renderPdf};