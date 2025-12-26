# SprintSpace API (current + target)

This doc describes the API surface used by the React UI.

## Current SprintSpace APIs

File: `sprintspace/api/tasks.py`

### `sprintspace.api.tasks.get_tasks`

- **Method**: GET (via `useFrappeGetCall`)
- **Args**:
  - `project` (string, required)
  - `page` (int, optional)
  - `page_size` (int, optional)
  - `filters` (stringified JSON, optional)
- **Returns**: kanban lists with full `Task` objects (currently includes comments + attachments arrays)

### `sprintspace.api.tasks.add_card`

- **Method**: POST
- **Args**:
  - `subject` (string)
  - `status` (string)
  - `project` (string)
- **Returns**: `{ "message": "Task added successfully" }`

### `sprintspace.api.tasks.update_card_order`

- **Method**: PUT
- **Args**:
  - `tasks`: JSON array of task updates
- **Returns**: `{ "message": "Tasks updated successfully" }`

## Built-in Frappe APIs used directly by the UI

### Assignments

- `frappe.desk.form.assign_to.add`
- `frappe.desk.form.assign_to.remove`

### Watching / Following

- `frappe.desk.form.document_follow.update_follow`

### CRUD updates

- `frappe.client.set_value` (wrapped by `useFrappeUpdateDoc`)
- File uploads (wrapped by `useFrappeFileUpload`)

## Target API contract (to implement)

All SprintSpace endpoints should return one of:

- Success: `{ "ok": true, "data": <payload> }`
- Error: `{ "ok": false, "error": { "code": "<string>", "message": "<string>" } }`

Target endpoints:

- `get_board(project, filters, ...)` — summary payload for kanban tiles (counts, not full comments/attachments)
- `get_task_detail(task_name)` — full detail payload for the modal
- `move_card(...)` — rank-based reorder (update a single card, not N cards)
- `add_comment(task_name, content)` — compose comment
- `get_project_members(project)` — restrict member picker to project members



