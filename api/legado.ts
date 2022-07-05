import { Request, Response } from 'express'
import { encode, decode } from 'js-base64'
import { FORMAT_CONTENT_TYPE } from '../ra'
module.exports = async (request: Request, response: Response) => {
  let ttsdata = request.query['data'].toString();
  let ttsdatastr = decode(decodeURIComponent(ttsdata)) ?? '';
  let ttsarr = JSON.parse(ttsdatastr) ?? {};
  let api = decodeURIComponent(ttsarr['url']) ?? '';
  let token = ttsarr['token'] ?? '';
  const alldata = [];
  ttsarr['ttsdata'].forEach(item =>{
    let name = decodeURIComponent(item['name']) ?? '大声朗读';
    let voiceName = item['voiceName'] ?? 'zh-CN-XiaoxiaoNeural';
    let voiceFormat = item['voiceFormat'] ?? 'audio-16khz-32kbitrate-mono-mp3';
    let styleName = item['styleName'] ?? 'normal';
    let styleDegree = item['styleDegree'] ?? 1.00;
    let speakSpeed = item['speakSpeed'] ?? 25;

      if (Array.isArray(voiceFormat)) {
        throw `Invalid format ${voiceFormat}`
      }
      if (!FORMAT_CONTENT_TYPE.has(voiceFormat as string)) {
        throw `Invalid format ${voiceFormat}`
      }
    
      const data = {}
      data['name'] = name == '' ? '大声朗读' : name
      data['concurrentRate'] = '1'
      data['contentType'] = FORMAT_CONTENT_TYPE.get(voiceFormat as string)
      data['id'] = Date.now()
      data['loginCheckJs'] = ''
      data['loginUi'] = ''
      data['loginUrl'] = ''
    
      let header = {
        'Content-Type': 'text/plain',
        Authorization: 'Bearer ' + token,
        Format: voiceFormat,
      }
      data['header'] = JSON.stringify(header)
    
      let ssml =
        '<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US">' +
          '<voice name="' +voiceName +'">' +
            '<prosody rate="{{speakSpeed + ' + speakSpeed + '}}%" pitch="+0Hz" volume="+100%">' +
              "{{String(speakText).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/'/g, '&apos;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}}" +
            '</prosody>' +
          '</voice>' +
        '</speak>'
      let body = {
        method: 'POST',
        body: ssml,
      }
      data['url'] = api + '/api/ra,' + JSON.stringify(body)
      alldata.push(data);
    })
  response.status(200).json(alldata)
}
