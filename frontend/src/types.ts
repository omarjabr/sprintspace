export type Board = {
  name: string;
  custom_bg: string;
};

export interface Project {
  name: string;
  owner: string;
  creation: Date;
  modified: Date;
  modified_by: string;
  docstatus: number;
  idx: number;
  naming_series: string;
  project_name: string;
  status: string;
  project_type: string;
  is_active: string;
  percent_complete_method: string;
  percent_complete: number;
  priority: string;
  custom_bg: string;
  actual_time: number;
  estimated_costing: number;
  total_costing_amount: number;
  total_expense_claim: number;
  total_purchase_cost: number;
  company: string;
  total_sales_amount: number;
  total_billable_amount: number;
  total_billed_amount: number;
  total_consumed_material_cost: number;
  gross_margin: number;
  per_gross_margin: number;
  collect_progress: number;
  frequency: string;
  from_time: string;
  to_time: string;
  first_email: string;
  second_email: string;
  daily_time_to_send: string;
  day_to_send: string;
  weekly_time_to_send: string;
  doctype: string;
  users: User[];
}

export interface User {
  name: string;
  owner: string;
  creation: Date;
  modified: Date;
  modified_by: string;
  docstatus: number;
  idx: number;
  user: string;
  email: string;
  image: string;
  full_name: string;
  welcome_email_sent: number;
  view_attachments: number;
  parent: string;
  parentfield: string;
  parenttype: string;
  doctype: string;
}

export type Task = {
  name: string;
  subject: string;
  status: string;
  priority: string;
  type: string;
  exp_start_date: string;
  exp_end_date: string;
  description: string;
  custom_kanban_index: number;
  completed_by: string;
  completed_on: string;
  _assign: string;
  creation: string;
  modified: string;
  project: string;
  is_document_followed: boolean;
  comments: Comment[];
  attachments: Attachment[];
  users: TaskUser[];
};

export type Comment = {
  name: string;
  comment_type: string;
  comment_email: string;
  comment_by: string;
  creation: string;
  content: string;
  reference_name: string;
};

export type Attachment = {
  name: string;
  file_name: string;
  file_url: string;
  file_type: string;
  attached_to_name: string;
  creation: string;
};

export type TaskUser = {
  name: string;
  full_name: string;
  email: string;
  user_image: string;
};
