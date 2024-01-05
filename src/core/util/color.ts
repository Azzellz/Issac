export type IssacColor = 'RESET' | 'RED' | 'GREEN' | 'YELLOW' | 'BLUE'
const COLOR: Record<IssacColor, string> = {
    RESET: '\x1b[0m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
}

export function colorText(content: string, color: IssacColor) {
    return COLOR[color] + content + COLOR.RESET
}