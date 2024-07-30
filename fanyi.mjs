import axios from "axios";
import md5 from "md5";

// 调用百度api翻译

export default async function translate(text) {
    const appid = 'xxx';
    const key = 'xxx';
    const salt = Date.now();
    const sign
        = md5(`${appid}${text}${salt}${key}`);
    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate`
    const res = await axios.get(url, {
        params: {
            q: text,
            from: 'en',
            to: 'fra',
            appid,
            salt,
            sign
        }
    });

    console.log(res.data)
}

translate('You will be redirected to the source code control management system for authentication.')