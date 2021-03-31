import report from './core'
import xhrRequest from './xhrRequest'

report.config.url = 'https://api.domain/supplementservice/v2/crashLog'

report.config.request = xhrRequest

window.MREPORT = report

export default report
