export function getFormattedTime(year: boolean = true) {
    //TODO 一位补零
    const date = new Date()
    const formattedDate = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
    const formattedMoment = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`

    return year ? `${formattedDate} ${formattedMoment}` : `${formattedMoment}`
}
    
