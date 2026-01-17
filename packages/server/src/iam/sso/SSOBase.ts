export default class SSOBase {
    protected config: any
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(_app: any, config?: any) {
        this.config = config
    }
    initialize() {}
    setSSOConfig(config: any) {
        this.config = config
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async refreshToken(_token: string) {
        return null
    }
}
