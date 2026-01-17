// TODO: add settings

import { Platform } from '../../Interface'
import { getRunningExpressApp } from '../../utils/getRunningExpressApp'

const getSettings = async () => {
    try {
        const appServer = getRunningExpressApp()
        const platformType = appServer.identityManager.getPlatformType()

        switch (platformType) {
            case Platform.IAM: {
                return { PLATFORM_TYPE: Platform.IAM }
            }
            case Platform.CLOUD: {
                return { PLATFORM_TYPE: Platform.CLOUD }
            }
            default: {
                return { PLATFORM_TYPE: Platform.OPEN_SOURCE }
            }
        }
    } catch (error) {
        return {}
    }
}

export default {
    getSettings
}
