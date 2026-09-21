function Env(name, opts) {
  class Http {
    constructor(env) {
      this.env = env;
    }

    send(opts, method = 'GET') {
      opts =
        typeof opts === 'string'
          ? {
              url: opts,
            }
          : opts;
      let sender = this.get;
      if (method === 'POST') {
        sender = this.post;
      }
      return new Promise((resolve, reject) => {
        sender.call(this, opts, (err, resp, body) => {
          if (err) reject(err);
          else resolve(resp);
        });
      });
    }

    get(opts) {
      return this.send.call(this.env, opts);
    }

    post(opts) {
      return this.send.call(this.env, opts, 'POST');
    }
  }

  return new (class {
    constructor(name, opts) {
      this.name = name;
      this.http = new Http(this);
      this.data = null;
      this.dataFile = 'box.dat';
      this.logs = [];
      this.isMute = false;
      this.isNeedRewrite = false;
      this.logSeparator = '\n';
      this.startTime = new Date().getTime();
      Object.assign(this, opts);
      this.log('', `🔔${this.name}, 开始!`);
    }

    initAxios() {
      if (!this.axios) {
        this.axios = axios.create();
      }
    }

    restApi(opts, callback = () => {}) {
      this.initAxios();
      this.axios(opts).then(
        (resp) => {
          const { status, headers, data } = resp;
          callback(
            null,
            {
              status,
              headers,
              data,
            },
            data,
          );
        },
        (err) => {
          const { message: error, response: resp } = err;
          callback(error, resp, resp && resp.data);
        },
      );
    }

    log(...logs) {
      if (logs.length > 0) {
        this.logs = [...this.logs, ...logs];
      }
      console.log(logs.join(this.logSeparator));
    }

    wait(time) {
      return new Promise((resolve) => setTimeout(resolve, time));
    }

    done() {
      const endTime = new Date().getTime();
      const costTime = (endTime - this.startTime) / 1000;
      this.log('', `🔔${this.name}, 结束! 🕛 ${costTime} 秒`);
    }
  })(name, opts);
}

module.exports = Env;
