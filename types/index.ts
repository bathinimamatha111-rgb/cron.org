export type CronJob = {
  id: string
  user_id: string
  title: string
  url: string
  schedule: string
  is_enabled: boolean
  notify_on_failure: boolean
  created_at: string
  updated_at?: string
}

export type Notification = {
  id: string
  user_id: string
  job_title: string | null
  message: string
  is_read: boolean
  created_at: string
}
