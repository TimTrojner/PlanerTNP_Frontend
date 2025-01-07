export type Task = {
  name: string
  urgent: boolean
  color: string
  /**ISO 8601 date string*/
  startDateTime: string
  /**ISO 8601 date string*/
  endDateTime: string
}
