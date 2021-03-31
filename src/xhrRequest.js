import config from './config'

import { deflate } from 'pako'
import { Base64 } from 'js-base64'
import AES from 'crypto-js/aes'
import Utf8 from 'crypto-js/enc-utf8'
import MD5 from 'crypto-js/md5'

import CBase64 from 'crypto-js/enc-base64'
import HmacSHA256 from 'crypto-js/hmac-sha256'

function createHeaders(method, requestUrl, bodyStream) {
    const Timestamp = new Date().getTime()
    let headers = {}

    const key = '111111111111111111111111'
    const secret = '2222222222222222222222222222222'

    let md5 = ''
    let contentMD5 = ''

    if (bodyStream) {
        md5 = MD5(bodyStream)
        contentMD5 = CBase64.stringify(md5)
    }

    const stringToSigned = `${method}\n${requestUrl}\n${Timestamp}\n${contentMD5}`

    const sign = CBase64.stringify(HmacSHA256(stringToSigned, secret))

    headers = {
        'Content-Type': 'application/json',
        'X-NAME-Ca-Timestamp': Timestamp,
        'X-NAME-Ca-Signature': sign,
        'X-NAME-Ca-Key': key
    }

    return Object.assign({}, headers, config.requestHeaders)
}

function encrypt(data) {
    const _data = {
        log: data
    }
    const key = '111111111111111111111111'

    const sign = Base64.btoa(deflate(JSON.stringify(_data), { gzip: true, to: 'string' }))

    const md5Key = MD5(key).toString().slice(8, 24)

    const code = AES.encrypt(Utf8.parse(sign), Utf8.parse(md5Key), {
        iv: Utf8.parse('0102030405060708')
    }).toString()

    return code
}

function request(data, cb) {
    console.log(data)
    const _data = {
        osType: 'web',
        crashLog: encrypt(data)
    }

    const headers = createHeaders('POST', config.url, JSON.stringify(_data))
    const keys = Object.keys(headers)
    const xhr = new XMLHttpRequest()
    xhr.open('post', config.url)
    keys.forEach(item => xhr.setRequestHeader(item, headers[item]))
    xhr.onreadystatechange = function onreadystatechange() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            cb && cb()
        }
    }
    return xhr.send(JSON.stringify(_data))
}

export default request
