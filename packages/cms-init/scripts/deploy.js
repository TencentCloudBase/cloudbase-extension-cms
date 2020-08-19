/* eslint-disable */
const fs = require('fs')
const util = require('util')
const path = require('path')
const writeFile = util.promisify(fs.writeFile)
const exec = util.promisify(require('child_process').exec)

module.exports = {
    // 部署静态资源
    async deployStatic(context) {
        const { config, deployPath, manager, accessDomain } = context
        const filterDeployPath = deployPath.replace(/^\//, '')
        const { envId } = config
        try {
            await exec('cp -r build /tmp')
        } catch (e) {}

        // 写入静态网站配置
        await writeConfigJSON(manager, envId, accessDomain, filterDeployPath)
        // 同步静态网站
        return deployHostingFile(manager, '/tmp/build', filterDeployPath)
    },
}

// 写入配置信息
async function writeConfigJSON(manager, envId, accessDomain, dir) {
    // 获取默认的自定义域名
    const { DefaultDomain } = await manager.getDomainList()

    accessDomain = accessDomain.replace('https://', '').replace('http://', '')

    await writeFile(
        '/tmp/config.js',
        JSON.stringify({
            envId,
            cloudAccessPath: `${accessDomain || DefaultDomain}/tcb-ext-cms-service`,
        })
    )

    return deployHostingFile(manager, '/tmp/config.js', path.join(dir, 'config.js'))
}

// 部署 Hosting 文件
async function deployHostingFile(manager, srcPath, cloudPath) {
    return manager.hosting.uploadFiles({
        localPath: srcPath,
        cloudPath: cloudPath,
        ignore: ['.DS_Store'],
    })
}
