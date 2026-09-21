/*
东东健康社区
更新时间：2021-4-22
活动入口：京东APP首页搜索 "玩一玩"即可

脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
===================quantumultx================
[task_local]
#东东健康社区
13 1,18 * * * https://raw.githubusercontent.com/444444/KR/main/jd_health.js, tag=东东健康社区, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/jd.png, enabled=true

=====================Loon================
[Script]
cron "13 1,18 * * *" script-path=https://raw.githubusercontent.com/444444/KR/main/jd_health.js, tag=东东健康社区

====================Surge================
东东健康社区 = type=cron,cronexp="13 1,18 * * *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/444444/KR/main/jd_health.js

============小火箭=========
东东健康社区 = type=cron,script-path=https://raw.githubusercontent.com/444444/KR/main/jd_health.js, cronexpr="13 1,18 * * *", timeout=3600, enable=true
 */
const Env = require('./function/env_c0cc2fc3.js');
const $ = new Env("东东健康社区");
const jdCookieNode = $.isNode() ? require("./jdCookie.js") : "";
const notify = $.isNode() ? require('./sendNotify') : "";
let cookiesArr = [], cookie = "", allMessage = "", message;
let reward = process.env.JD_HEALTH_REWARD_NAME ? process.env.JD_HEALTH_REWARD_NAME : ''
const randomCount = $.isNode() ? 20 : 5;
$.newShareCodes = [];
let UserShareCodes = "";
function oc(fn, defaultVal) { //optioanl chaining
	try {
		return fn()
	} catch (e) {
		return undefined
	}
}
function nc(val1, val2) {//nullish coalescing
  return val1 != undefined ? val1 : val2
}
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item]);
  });
  if (process.env.JD_DEBUG && process.env.JD_DEBUG === "false") console.log = () => {};
} else {
	cookiesArr = [$.getdata("CookieJD"), $.getdata("CookieJD2"), ...$.toObj($.getdata("CookiesJD") || "[]").map((item) => item.cookie)].filter((item) => !!item);
}
const JD_API_HOST = "https://api.m.jd.com/";
!(async () => {
  if (!cookiesArr[0]) {
    $.msg($.name, "【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取", "https://bean.m.jd.com/", {"open-url": "https://bean.m.jd.com/"});
    return;
  }
	console.log(`开始执行任务....\n`);
	for (let i = 0; i < cookiesArr.length; i++) {
		if (cookiesArr[i]) {
			cookie = cookiesArr[i];
			$.UserName = decodeURIComponent(cookie.match(/pt_pin=([^; ]+)(?=;?)/) && cookie.match(/pt_pin=([^; ]+)(?=;?)/)[1]);
			$.index = i + 1;
			message = "";
			console.log(`\n******开始【京东账号${$.index}】${$.UserName}*********\n`);
			await main()
			await showMsg()
		}
	}
	if ($.isNode() && allMessage) {
		await notify.sendNotify(`${$.name}`, `${allMessage}`)
	}
})()
.catch((e) => {
	$.log("", `❌ ${$.name}, 失败! 原因: ${e}!`, "");
})
.finally(() => {
	$.done();
});

async function main() {
	try {
    $.score = 0
    $.earn = false
    await getTaskDetail(-1)
    await getTaskDetail(16)
    await getTaskDetail(6)
    for(let i = 0 ; i < 5; ++i){
      $.canDo = false
      await getTaskDetail()
      if(!$.canDo) break
      await $.wait(1000)
    }
    await collectScore()
    await getTaskDetail(22);
    await getTaskDetail(-1)

    if (reward) {
      await getCommodities()
    }
	await exchanges()

  } catch (e) {
    $.logErr(e)
	}
}

function showMsg() {
	return new Promise(async resolve => {
		message += `本次获得${$.earn}健康值，累计${$.score}健康值\n`
		$.msg($.name, '', `京东账号${$.index} ${$.UserName}\n${message}`);
		resolve();
	})
}

function getTaskDetail(taskId = '') {
  return new Promise(resolve => {
    $.get(taskUrl('jdhealth_getTaskDetail', {"buildingId": "", taskId: taskId === -1 ? '' : taskId, "channelId": 1}),
      async (err, resp, data) => {
        try {
          if (safeGet(data)) {
            data = $.toObj(data)
            if (taskId === -1) {
              let tmp = parseInt(parseFloat(nc(oc(() => data.data.result.userScore) , '0')))
              if (!$.earn) {
                $.score = tmp
                $.earn = 1
              } else {
                $.earn = tmp - $.score
                $.score = tmp
              }
            } else if (taskId === 6) {
              if (oc(() => data.data.result.taskVos)) {
                console.log(`\n【京东账号${$.index}（${$.UserName}）的${$.name}好友互助码】${oc(() => data.data.result.taskVos[0].assistTaskDetailVo.taskToken)}\n`);
                // console.log('好友助力码：' + data?.data?.result?.taskVos[0].assistTaskDetailVo.taskToken)
              }
            } else if (taskId === 22) {
              console.log(`${oc(() => data.data.result.taskVos[0].taskName)}任务，完成次数：${oc(() => data.data.result.taskVos[0].times)}/${oc(() => data.data.result.taskVos[0].maxTimes)}`)
              if (oc(() => data.data.result.taskVos[0].times) === oc(() => data.data.result.taskVos[0].maxTimes)) return
              await doTask(oc(() => data.data.result.taskVos[0].shoppingActivityVos[0].taskToken), 22, 1)//领取任务
              await $.wait(1000 * (oc(() => data.data.result.taskVos[0].waitDuration) || 3));
              await doTask(oc(() => data.data.result.taskVos[0].shoppingActivityVos[0].taskToken), 22, 0);//完成任务
            } else {
              for (let vo of nc(oc(() => data.data.result.taskVos.filter(vo => ![19,25,15,21].includes(vo.taskType))) , [])) {
                console.log(`${vo.taskName}任务，完成次数：${vo.times}/${vo.maxTimes}`)
                for (let i = vo.times; i < vo.maxTimes; i++) {
                  console.log(`去完成${vo.taskName}任务`)
                  if (vo.taskType === 13) {
                    await doTask(oc(() => vo.simpleRecordInfoVo.taskToken), oc(() => vo.taskId))
                  } else if (vo.taskType === 8) {
                    await doTask(oc(() => vo.productInfoVos[i].taskToken), oc(() => vo.taskId), 1)
                    await $.wait(1000 * 10)
                    await doTask(oc(() => vo.productInfoVos[i].taskToken), oc(() => vo.taskId), 0)
                  } else if (vo.taskType === 9) {
                    await doTask(oc(() => vo.shoppingActivityVos[0].taskToken), oc(() => vo.taskId), 1)
                    await $.wait(1000 * 10)
                    await doTask(oc(() => vo.shoppingActivityVos[0].taskToken), oc(() => vo.taskId), 0)
                  } else if (vo.taskType === 10) {
                    await doTask(oc(() => vo.threeMealInfoVos[0].taskToken), oc(() => vo.taskId))
                  } else if (vo.taskType === 26 || vo.taskType === 3) {
                    await doTask(oc(() => vo.shoppingActivityVos[0].taskToken), oc(() => vo.taskId))
                  } else if (vo.taskType === 1) {
                    for (let key of Object.keys(vo.followShopVo)) {
                      let taskFollow = vo.followShopVo[key]
                      if (taskFollow.status !== 2) {
                        await doTask(taskFollow.taskToken, vo.taskId, 0)
                        break
                      }
                    }
                  }
                  await $.wait(2000)
                }
              }
            }
          }
        } catch (e) {
          console.log(e)
        } finally {
          resolve()
        }
      })
  })
}

function exchanges(commodityType, commodityId) {
  return new Promise(resolve => {
    const options = taskUrl('jdhealth_doLottery', {"taskId":1})
    $.post(options, (err, resp, data) => {
      try {
        if (safeGet(data)) {
          data = $.toObj(data)
          if (data.data.bizCode === 0 || data.data.bizMsg === "success") {
            $.score = data.data.result.jingBeanNum
            console.log(`领取${data.data.result.jingBeanNum}京豆成功`)
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve(data)
      }
    })
  })
}

async function getCommodities() {
  return new Promise(async resolve => {
    const options = taskUrl('jdhealth_getCommodities')
    $.post(options, async (err, resp, data) => {
      try {
        if (safeGet(data)) {
          data = $.toObj(data)
          let beans = data.data.result.jBeans.filter(x => x.status !== 0 && x.status !== 1)
          if (beans.length !== 0) {
            for (let key of Object.keys(beans)) {
              let vo = beans[key]
              if (vo.title === reward && $.score >= vo.exchangePoints) {
                await $.wait(1000)
                await exchange(vo.type, vo.id)
              }
            }
          } else {
            console.log(`兑换京豆次数已达上限`)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve(data)
      }
    })
  })
}
function exchange(commodityType, commodityId) {
  return new Promise(resolve => {
    const options = taskUrl('jdhealth_exchange', {commodityType, commodityId})
    $.post(options, (err, resp, data) => {
      try {
        if (safeGet(data)) {
          data = $.toObj(data)
          if (data.data.bizCode === 0 || data.data.bizMsg === "success") {
            $.score = data.data.result.userScore
            console.log(`兑换${data.data.result.jingBeanNum}京豆成功`)
            message += `兑换${data.data.result.jingBeanNum}京豆成功\n`
            if ($.isNode()) {
              allMessage += `【京东账号${$.index}】 ${$.UserName}\n兑换${data.data.result.jingBeanNum}京豆成功🎉${$.index !== cookiesArr.length ? '\n\n' : ''}`
            }
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        console.log(e)
      } finally {
        resolve(data)
      }
    })
  })
}

function doTask(taskToken, taskId, actionType = 0) {
  return new Promise(resolve => {
    const options = taskUrl('jdhealth_collectScore', {taskToken, taskId, actionType})
    $.get(options,
      (err, resp, data) => {
        try {
          if (safeGet(data)) {
            data = $.toObj(data)
            if ([0, 1].includes(nc(oc(() => data.data.bizCode) , -1))) {
              $.canDo = true
              if (oc(() => data.data.result.score))
                console.log(`任务完成成功，获得：${nc(oc(() => data.data.result.score) , '未知')}能量`)
              else
                console.log(`任务领取结果：${nc(oc(() => data.data.bizMsg) , JSON.stringify(data))}`)
            } else {
              console.log(`任务完成失败：${nc(oc(() => data.data.bizMsg) , JSON.stringify(data))}`)
            }
          }
        } catch (e) {
          console.log(e)
        } finally {
          resolve(data)
        }
      })
  })
}

function collectScore() {
  return new Promise(resolve => {
    $.get(taskUrl('jdhealth_collectProduceScore', {}),
      (err, resp, data) => {
        try {
          if (safeGet(data)) {
            data = $.toObj(data)
            if (oc(() => data.data.bizCode) === 0) {
              if (oc(() => data.data.result.produceScore))
                console.log(`任务完成成功，获得：${nc(oc(() => data.data.result.produceScore) , '未知')}能量`)
              else
                console.log(`任务领取结果：${nc(oc(() => data.data.bizMsg) , JSON.stringify(data))}`)
            } else {
              console.log(`任务完成失败：${nc(oc(() => data.data.bizMsg) , JSON.stringify(data))}`)
            }
          }
        } catch (e) {
          console.log(e)
        } finally {
          resolve()
        }
      })
  })
}

function taskUrl(function_id, body = {}) {
	return {
		url: `${JD_API_HOST}?functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0&uuid=`,
		headers: {
			"Cookie": cookie,
			"origin": "https://h5.m.jd.com",
			"referer": "https://h5.m.jd.com/",
			'accept-language': 'zh-cn',
			'accept-encoding': 'gzip, deflate, br',
			'accept': 'application/json, text/plain, */*',
			'Content-Type': 'application/x-www-form-urlencoded',
			"User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.4.4;14.3;network/4g;Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148;supportJDSHWK/1")
		}
	}
}

function safeGet(data) {
	try {
		if (typeof JSON.parse(data) == "object") {
			return true;
		}
	} catch (e) {
		console.log(e);
		console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
		return false;
	}
}

// prettier-ignore
