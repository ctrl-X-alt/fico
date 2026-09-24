const {buildReportHtml}=require("@fico/core");
let chromiumPromise;
function getChromium(){if(!chromiumPromise)chromiumPromise=(async()=>{const{chromium}=require("playwright");return chromium})();return chromiumPromise}
const MAX_CONCURRENT_PDF=Math.max(1,Number(process.env.PDF_MAX_CONCURRENT||2));let active=0,queue=[];
async function acquire(){if(active<MAX_CONCURRENT_PDF){active++;return}await new Promise(resolve=>queue.push(resolve));active++}
function release(){active--;const next=queue.shift();if(next)next()}
async function renderReport(analysis){if(!analysis?.result)throw Object.assign(new Error("report_requires_completed_analysis"),{code:"report_requires_completed_analysis"});return buildReportHtml(analysis)}
async function renderPdf(analysis){await acquire();try{const html=await renderReport(analysis),chromium=await getChromium(),browser=await chromium.launch({headless:true});try{const page=await browser.newPage({viewport:{width:1240,height:1754}});await page.setContent(html,{waitUntil:"domcontentloaded",timeout:Number(process.env.PDF_PAGE_TIMEOUT_MS||20000)});return await page.pdf({format:"A4",printBackground:true,preferCSSPageSize:true,margin:{top:"18mm",right:"16mm",bottom:"18mm",left:"16mm"}})}finally{await browser.close()}}finally{release()}}
module.exports={renderReport,renderPdf};