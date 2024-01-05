import { colorText } from "./util/color"
import { getFormattedTime } from "./util/time"

interface IssacWarnerConfig {

}
const defaultIssacWarnerConfig: IssacWarnerConfig = {}
/**
* 警告器
* @private
*/
export class IssacWarner {
    private config: IssacWarnerConfig
    public warnings: Array<string> = []
    constructor(config: IssacWarnerConfig = defaultIssacWarnerConfig) {
        this.config = config
    }
    public warn(message: string) {
        this.warnings.push(message)
        console.warn(colorText(`[Issac-Warning/${getFormattedTime(false)}]:${message}`, 'YELLOW'))
    }
}