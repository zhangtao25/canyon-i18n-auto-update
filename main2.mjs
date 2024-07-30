import fs from 'fs';
import {exec} from 'child_process';
import { promisify } from 'util';
const execPromise = promisify(exec);
/**
 * Language Codes and Names
 * 名称      代码
 // * 自动检测  auto
 // * 中文      zh
 // * 英语      en
 // * 粤语      yue
 // * 文言文    wyw
 * 日语      jp
 * 韩语      kor
 * 法语      fra
 * 西班牙语  spa
 * 泰语      th
 * 阿拉伯语  ara
 * 俄语      ru
 * 葡萄牙语  pt
 * 德语      de
 * 意大利语  it
 * 希腊语    el
 * 荷兰语    nl
 * 波兰语    pl
 * 保加利亚语 bul
 * 爱沙尼亚语 est
 * 丹麦语    dan
 * 芬兰语    fin
 * 捷克语    cs
 * 罗马尼亚语 rom
 * 斯洛文尼亚语 slo
 * 瑞典语    swe
 * 匈牙利语  hu
 * 繁体中文  cht
 * 越南语    vie
 */

const languages = [
    "kor",
    "fra",
    "spa",
    "th",
    "ara",
    "ru",
    "pt",
    "de",
    "it",
    "el",
    "nl",
    "pl",
    "bul",
    "est",
    "dan",
    "fin",
    "cs",
    "rom",
    "slo",
    "swe",
    "hu",
    "cht",
    "vie"
];


import axios from 'axios';
import md5 from "md5";
// 0.读取配置
const env = fs.readFileSync('./env.txt').toString().trim();

function sleep(time) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    })
}


while (true) {
    try {
        // 1.git clone 仓库

        async function gitClone(repoUrl, targetDir) {
            return new Promise((resolve, reject) => {
                const command = `git clone ${repoUrl} ${targetDir} && cd canyon && git checkout test && git remote set-url origin https://zhangtao25:${env}@github.com/canyon-project/canyon.git && cd ..`;
                exec(command, (error, stdout, stderr) => {
                    resolve();
                });
            })
        }

        const repoUrl = 'https://github.com/canyon-project/canyon.git'; // Replace with your repository URL
        const targetDir = ''; // Replace with your target directory

        await gitClone(repoUrl, targetDir);









        // 2.读取英文翻译文件

        const enTranslation = fs.readFileSync('./canyon/packages/canyon-platform/locales/en.json').toString().trim();
        // const

        for (let i = 0; i < languages.length; i++) {
            // 根据英文翻译文件生成其他语言翻译文件
            // 3.调用百度api翻译
            const fanyienv = fs.readFileSync('./en-fanyi.txt').toString().trim().split(';');
            const appid = fanyienv[0];
            const appkey = fanyienv[1];



            // 遍历需要翻译的json
            const enTranslationObj = JSON.parse(enTranslation);

            const translationRes = {}

            for (let key in enTranslationObj) {
                for (const keyKey in enTranslationObj[key]) {
                    const salt = Date.now();
                    const sign
                        = md5(`${appid}${enTranslationObj[key][keyKey]}${salt}${appkey}`);
                    const url = `https://fanyi-api.baidu.com/api/trans/vip/translate`
                    const res = await axios.get(url, {
                        params: {
                            q: enTranslationObj[key][keyKey],
                            from: 'en',
                            to: languages[i],
                            appid,
                            salt,
                            sign
                        }
                    });
                    // console.log(`${appid}${enTranslationObj[key][keyKey]}${salt}${key}`)
                    console.log(JSON.stringify(res.data),languages[i],enTranslationObj[key][keyKey])
                    if (!translationRes[key]){
                        translationRes[key] = {}
                    }

                    if (res.data?.trans_result?.length>0){
                        translationRes[key][keyKey] = res.data.trans_result[0].dst
                    } else {
                        translationRes[key][keyKey] = enTranslationObj[key][keyKey]
                    }
                }
            }
            await fs.writeFileSync(`./locales/${languages[i]}.json`, JSON.stringify(translationRes,null,2), 'utf-8');
        }

//         强制copy到canyon
        const command = `cp -r ./locales ./canyon/packages/canyon-platform/`;
        const { stdout, stderr } = await execPromise(command);
        console.log('stdout:', stdout);
        if (stderr) {
            console.error('stderr:', stderr);
        }








// 4.提交代码

        async function gitCommitAndPush() {
            try {
                const command = `cd canyon && git branch && git config user.name "Allen Zhang" && git config user.email "wr_zhang25@163.com" && git add . && git commit -m "Update dependencies" && git push origin test:test && cd .. && rm -rf canyon`;
                const { stdout, stderr } = await execPromise(command);
                console.log('stdout:', stdout);
                if (stderr) {
                    console.error('stderr:', stderr);
                }
            } catch (error) {
                console.error('Error:', error);
                throw error;  // Rethrow the error if you need to handle it upstream
            }
        }

        await gitCommitAndPush();
    } catch (e) {
        console.log(e,'错误了')
        try {
            const command = `rm -rf canyon`;
            const { stdout, stderr } = await execPromise(command);
            console.log('stdout:', stdout);
            if (stderr) {
                console.error('stderr:', stderr);
            }
        } catch (error) {
            console.error('Error:', error);
            throw error;  // Rethrow the error if you need to handle it upstream
        }
    }
    await sleep(60*60*1000)
    // await sleep(1*1000)
}



// return
