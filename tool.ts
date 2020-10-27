/*
本类包含了一些常用的静态方法。
 */
import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import * as bytes from "bytes";

const Tool = {

    /**
     * 获取 在Github上 的项目的提交列表。
     *
     * owner: 仓库归属人
     * repos: 仓库名称
     * per_page: 每页多少条（默认2）
     * page: 页码，(从1开始计)
     *
     * @return 返回一个JavaScript数组。此数组格式见: http://filetest.microanswer.cn/github_commit_list_response.json
     *
     * @author fanxuejiao
     * @date 2020年8月17日16点55分
     */
    async getGitHubReposCommitList (owner, repos, per_page = 2, page = 1) {

        // 此api由github提供，你可以通过：https://docs.github.com/en/rest/reference/repos#list-commits 查看更多详细文档。
        return axios.get(`https://api.github.com/repos/${owner}/${repos}/commits?` + Tool.url2quuery({
            per_page, page
        }), {
            headers: {
                "accept": " application/vnd.github.v3+json"
            }
        }).then(result => {
            return result.data;
        });
    },

    /**
     * 将 对象转换为 形如: name=Jack&age=12 形式的query字符串。
     *
     *
     * 目前此方法未使用任何其它模块实现，而是通过纯编码实现，后续可能使用其它模块(qs)来实现。
     * @param query
     * @author fanxuejiao
     * @date 2020年8月17日16点55分
     */
    url2quuery (query) {
        let queryStr = "";
        for (let f in query) {
            if (query.hasOwnProperty(f)) {
                queryStr += (encodeURIComponent(f) + "=" + encodeURIComponent(query[f]));
                queryStr += "&";
            }
        }
        if (queryStr.length > 0) {
            // 去掉最后一个 &
            queryStr = queryStr.substring(0, queryStr.length - 1);
        }

        return queryStr;
    },

    /**
     * 获取当前运行的代码的最新tag版本号。本方法将读取 ./.git/packed-refs 文件。
     * 截至 2020年8月18日17点59分，此方法会返回 0.1.1
     *
     * 如果没有发布过任何tag，或此文件不存在，将返回 0.0.0
     *
     * @author fanxuejiao
     * @date 2020年8月18日17点46分
     *
     */
    getLastestTag() {
        let tagsFile = path.resolve(__dirname, ".git/packed-refs");
        if (!fs.existsSync(tagsFile)) {
            // 文件不存在。
            return "0.0.0";
        } else {
            let fileContent = fs.readFileSync(tagsFile, {encoding: "utf-8"});

            if (!fileContent || fileContent.length === 0) {
                // 文件内容为空。
                return "0.0.0";
            }

            let strings = fileContent.split(/\r?\n/g);

            // 取最后一行，则表示本地最新的tag。
            let lastestTagLine = null;
            while (!lastestTagLine && strings.length > 0) {
                lastestTagLine = strings.pop(); // 使用while循环，因为有可能存在最后一行空行。
            }
            let temps = lastestTagLine.split("/");
            let lastestTag = (temps[temps.length - 1] || "").trim();

            // 如果没有 发布过relase， 则不会有版本号格式的数据，会拿到一个 master
            // 所以这里判断一下，如果符合版本号格式，才返回。
            if (lastestTag.match(/^[0-9]+(.[0-9]+)+$/g)) {
                return lastestTag;
            } else {
                return "0.0.0";
            }
        }

    },

    /**
     * 获取当前系统状态。
     */
    systemStat() {

        // 总内存
        let totalmem = os.totalmem();
        let totalmemStr = bytes.format(totalmem);

        // 空闲内存
        let freemem = os.freemem();
        let freememStr = bytes.format(freemem);

        // 已使用内存
        let usedMem = totalmem - freemem;
        let usedMemStr = bytes.format(usedMem);

        // CPU信息
        let cpus:any[] = os.cpus();
        cpus = cpus.map(({model, speed, times:{user,sys,idle,irq}}, index) => {

            // 用户+系统+中断+空闲 = 总量
            let total = user + sys + idle + irq;

            // 去除空闲的 剩下的就是 已使用的
            let used = user + sys + irq;
            return {
                // 核心名称
                model: model.trim(),

                total: total,

                // 空闲 以及空闲比例
                free: idle,
                freeRatio: parseFloat((idle / total).toFixed(2)),

                // 已使用 比例
                usedRatio: parseFloat((used / total).toFixed(2)),

                // 核心速度，单位(兆赫兹,MHZ)
                speed: speed
            }
        })

        return {
            totalmem,
            totalmemStr,
            freemem,
            freememStr,
            usedMem,
            usedMemStr,
            freeMemRatio: parseFloat((freemem / totalmem).toFixed(2)),
            usedMemRatio: parseFloat((usedMem / totalmem).toFixed(2)),
            cpus,
        }
    }
};

export default Tool;