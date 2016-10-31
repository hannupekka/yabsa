declare type NotificationType =
  | 'success'
  | 'error';

declare type NotificationOptionsType = {
  title:string,
  body:string,
  type:NotificationType,
  icon?:string,
  timeout?:number
}
