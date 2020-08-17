/*
本类包含了一些常用的静态方法。
 */
import axios from "axios";

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
    }
};

export default Tool;