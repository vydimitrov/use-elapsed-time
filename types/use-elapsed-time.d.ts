/** Optional configuration object */
export interface Config {
    /** Animation duration in milliseconds */
    durationMilliseconds?: number,
    /** 
     * On animation complete event handler. It can be used to restart the animation by returning an array
     * where the first element "shouldRepeat" indicates if the loop should start over
     * and second element "delay" specifies the delay before looping again in milliseconds.
     * 
     */
    onComplete?: () => undefined | [boolean, number] // [shouldRepeat: boolean, delay: number]
}

export function useElapsedTime(
    isPlaying: boolean,
    config?: Config
): number;