from __future__ import annotations

from typing import Any, Dict, List, Optional, Sequence, Tuple

import frappe
from frappe import _
from frappe.utils import cint
from frappe.utils.html_utils import escape_html

# Constants
KANBAN_LIST = [
    {"id": "Open", "icon": "🚀", "color": "#4CAF50"},
    {"id": "Working", "icon": "🛠️", "color": "#2196F3"},
    {"id": "Pending Review", "icon": "⏳", "color": "#FFC107"},
    {"id": "Overdue", "icon": "⏰", "color": "#F44336"},
    {"id": "Completed", "icon": "🎉", "color": "#9C27B0"}
]

KANBAN_STATUSES = [c["id"] for c in KANBAN_LIST]


def _ok(data: Any) -> Dict[str, Any]:
    return {"ok": True, "data": data}


def _err(code: str, message: str) -> Dict[str, Any]:
    return {"ok": False, "error": {"code": code, "message": message}}


def _parse_filters(filters: Optional[str]) -> Dict[str, Any]:
    if not filters:
        return {}
    try:
        parsed = frappe.parse_json(filters)
        return parsed or {}
    except Exception:
        return {}


def _validate_statuses(statuses: Sequence[str]) -> None:
    invalid = [s for s in statuses if s not in KANBAN_STATUSES]
    if invalid:
        frappe.throw(_("Invalid status in filter: {0}").format(", ".join(invalid)))


def _build_task_filters(project: str, filters: Dict[str, Any]) -> Dict[str, Any]:
    task_filters: Dict[str, Any] = {"project": project}

    statuses = filters.get("status") or []
    if isinstance(statuses, (list, tuple)) and len(statuses) > 0:
        _validate_statuses(statuses)
        task_filters["status"] = ["in", list(statuses)]

    priorities = filters.get("priority") or []
    if isinstance(priorities, (list, tuple)) and len(priorities) > 0:
        task_filters["priority"] = ["in", list(priorities)]

    types = filters.get("type") or []
    if isinstance(types, (list, tuple)) and len(types) > 0:
        task_filters["type"] = ["in", list(types)]

    date_range = filters.get("dateRange") or {}
    if isinstance(date_range, dict):
        if date_range.get("start"):
            task_filters["exp_start_date"] = [">=", date_range["start"]]
        if date_range.get("end"):
            task_filters["exp_end_date"] = ["<=", date_range["end"]]

    # Text search (subject)
    q = filters.get("q") or filters.get("query")
    if isinstance(q, str) and q.strip():
        task_filters["subject"] = ["like", f"%{q.strip()}%"]

    return task_filters


def get_task_data(
    project: str,
    page: int = 1,
    page_size: int = 9999,
    filters: Optional[Dict[str, Any]] = None,
    *,
    include_comments: bool = True,
    include_attachments: bool = True,
    include_description: bool = True,
) -> List[Dict[Any, Any]]:
    """Get tasks with related data in optimized queries.

    Use include_* flags to avoid loading heavy data for board view.
    """
    try:
        # Calculate pagination
        start = (page - 1) * page_size

        task_filters = _build_task_filters(project, filters or {})

        # Get tasks with main data
        has_rank = frappe.db.has_column("Task", "custom_kanban_rank")
        fields = [
            "name",
            "subject",
            "status",
            "priority",
            "type",
            "exp_start_date",
            "exp_end_date",
            "custom_kanban_index",
            "completed_by",
            "completed_on",
            "_assign",
            "creation",
            "modified",
            "project",
        ]
        if has_rank:
            fields.append("custom_kanban_rank")
        if include_description:
            fields.append("description")

        tasks = frappe.get_all(
            "Task",
            filters=task_filters,
            fields=fields,
            order_by=(
                "custom_kanban_rank asc, custom_kanban_index asc"
                if has_rank
                else "custom_kanban_index asc"
            ),
            start=start,
            page_length=page_size
        )

        if not tasks:
            return []

        # Get all task names for batch queries
        task_names = [task.name for task in tasks]

        attachments = []
        if include_attachments:
            # Batch query for attachments
            attachments = frappe.get_all(
                "File",
                filters={
                    "attached_to_doctype": "Task",
                    "attached_to_name": ["in", task_names]
                },
                fields=["name", "file_name", "file_url",
                        "file_type", "attached_to_name", "creation"],
            )

        # Batch query is_document_followed for each task
        is_document_followed = frappe.get_all(
            "Document Follow",
            filters={
                "ref_doctype": "Task",
                "ref_docname": ["in", task_names],
                "user": frappe.session.user
            },
            fields=["ref_docname"]
        )

        comments = []
        if include_comments:
            # Batch query for comments
            comments = frappe.get_all(
                "Comment",
                filters={
                    "reference_doctype": "Task",
                    "reference_name": ["in", task_names]
                },
                fields=[
                    "name", "comment_type", "comment_email",
                    "comment_by", "creation", "content",
                    "reference_name"
                ],
                order_by="creation desc"
            )

        # Create lookup dictionaries for faster access
        attachments_by_task = {}
        if include_attachments:
            for attachment in attachments:
                if attachment.attached_to_name not in attachments_by_task:
                    attachments_by_task[attachment.attached_to_name] = []
                attachments_by_task[attachment.attached_to_name].append(attachment)

        comments_by_task = {}
        if include_comments:
            for comment in comments:
                if comment.reference_name not in comments_by_task:
                    comments_by_task[comment.reference_name] = []
                comments_by_task[comment.reference_name].append(comment)

        # Create lookup dictionary for is_document_followed
        is_document_followed_dict = {
            doc.ref_docname: True for doc in is_document_followed}

        # Collect all user emails for batch query
        user_emails = set()
        for task in tasks:
            if task._assign:
                assigned_users = frappe.parse_json(task._assign)
                user_emails.update(assigned_users)

        # Batch query for user data
        users_data = {}
        if user_emails:
            users = frappe.get_all(
                "User",
                filters={"email": ["in", list(user_emails)]},
                fields=["name", "email", "full_name", "user_image"]
            )
            users_data = {user.email: user for user in users}

        # Combine all data
        for task in tasks:
            if include_attachments:
                task.attachments = attachments_by_task.get(task.name, [])
            if include_comments:
                task.comments = comments_by_task.get(task.name, [])
            task.is_document_followed = is_document_followed_dict.get(
                task.name, False)
            task.users = []

            if task._assign:
                assigned_users = frappe.parse_json(task._assign)
                task.users = [users_data.get(
                    email) for email in assigned_users if email in users_data]

        return tasks

    except Exception as e:
        frappe.log_error(f"Error fetching tasks: {str(e)}")
        return []


@frappe.whitelist()
def get_board(project: str, page: int = 1, page_size: int = 9999, filters: str = None) -> Dict[str, Any]:
    """Lightweight kanban board payload (summary-only).

    Returns task tiles without full comments/attachments arrays; includes counts instead.
    """
    try:
        if not project:
            return _err("validation", _("Project is required"))

        if not frappe.has_permission("Project", "read", project):
            return _err("permission", _("Not permitted to view tasks"))

        page = cint(page)
        page_size = cint(page_size)
        if page < 1 or page_size < 1:
            return _err("validation", _("Invalid pagination parameters"))

        filter_dict = _parse_filters(filters)
        task_filters = _build_task_filters(project, filter_dict)

        tasks = get_task_data(
            project,
            page,
            page_size,
            filter_dict,
            include_comments=False,
            include_attachments=False,
            include_description=False,
        )
        if not tasks:
            return _ok({"lists": [{**c, "cards": []} for c in KANBAN_LIST], "total": 0})

        task_names = [t.name for t in tasks]

        # Counts (comments / attachments)
        comments_counts = {
            r["reference_name"]: r["cnt"]
            for r in frappe.get_all(
                "Comment",
                filters={
                    "reference_doctype": "Task",
                    "reference_name": ["in", task_names],
                    "comment_type": "Comment",
                },
                fields=["reference_name", "count(name) as cnt"],
                group_by="reference_name",
            )
        }
        attachments_counts = {
            r["attached_to_name"]: r["cnt"]
            for r in frappe.get_all(
                "File",
                filters={
                    "attached_to_doctype": "Task",
                    "attached_to_name": ["in", task_names],
                },
                fields=["attached_to_name", "count(name) as cnt"],
                group_by="attached_to_name",
            )
        }

        for t in tasks:
            t.comments_count = int(comments_counts.get(t.name, 0))
            t.attachments_count = int(attachments_counts.get(t.name, 0))

        tasks_by_status: Dict[str, List[Any]] = {}
        for t in tasks:
            tasks_by_status.setdefault(t.status, []).append(t)

        kanban_lists = [
            {
                "id": col["id"],
                "icon": col["icon"],
                "color": col["color"],
                "cards": tasks_by_status.get(col["id"], []),
            }
            for col in KANBAN_LIST
        ]

        total = frappe.db.count("Task", task_filters)
        return _ok({"lists": kanban_lists, "total": total})
    except Exception as e:
        frappe.log_error(f"Error in get_board: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def get_task_detail(task_name: str) -> Dict[str, Any]:
    """Full detail payload for a single task (used by the modal)."""
    try:
        if not task_name:
            return _err("validation", _("Task name is required"))

        if not frappe.has_permission("Task", "read", task_name):
            return _err("permission", _("Not permitted to view this task"))

        tasks = frappe.get_all(
            "Task",
            filters={"name": task_name},
            fields=[
                "name",
                "subject",
                "status",
                "priority",
                "type",
                "exp_start_date",
                "exp_end_date",
                "description",
                "custom_kanban_index",
                "completed_by",
                "completed_on",
                "_assign",
                "creation",
                "modified",
                "project",
            ],
            limit=1,
        )
        if tasks and frappe.db.has_column("Task", "custom_kanban_rank"):
            # get_all can't have dynamic fields mid-call; fetch rank separately for this one record
            rank = frappe.db.get_value("Task", task_name, "custom_kanban_rank")
            tasks[0].custom_kanban_rank = rank
        if not tasks:
            return _err("not_found", _("Task not found"))

        task = tasks[0]
        task_names = [task.name]

        attachments = frappe.get_all(
            "File",
            filters={"attached_to_doctype": "Task", "attached_to_name": ["in", task_names]},
            fields=["name", "file_name", "file_url", "file_type", "attached_to_name", "creation"],
            order_by="creation desc",
        )
        comments = frappe.get_all(
            "Comment",
            filters={"reference_doctype": "Task", "reference_name": ["in", task_names]},
            fields=[
                "name",
                "comment_type",
                "comment_email",
                "comment_by",
                "creation",
                "content",
                "reference_name",
            ],
            order_by="creation desc",
        )
        followed = frappe.get_all(
            "Document Follow",
            filters={"ref_doctype": "Task", "ref_docname": task.name, "user": frappe.session.user},
            fields=["ref_docname"],
            limit=1,
        )

        # Assigned users
        task.users = []
        if task._assign:
            assigned_users = frappe.parse_json(task._assign) or []
            users = frappe.get_all(
                "User",
                filters={"email": ["in", list(set(assigned_users))]},
                fields=["name", "email", "full_name", "user_image"],
            )
            users_by_email = {u.email: u for u in users}
            task.users = [users_by_email[email] for email in assigned_users if email in users_by_email]

        task.attachments = attachments
        task.comments = comments
        task.comments_count = len([c for c in comments if c.comment_type == "Comment"])
        task.attachments_count = len(attachments)
        task.is_document_followed = bool(followed)

        return _ok(task)
    except frappe.DoesNotExistError:
        return _err("not_found", _("Task not found"))
    except Exception as e:
        frappe.log_error(f"Error in get_task_detail: {str(e)}")
        return _err("server_error", str(e))


# Backwards-compatible alias (frontend previously called get_tasks)
@frappe.whitelist()
def get_tasks(project: str, page: int = 1, page_size: int = 9999, filters: str = None) -> Dict[str, Any]:
    return get_board(project=project, page=page, page_size=page_size, filters=filters)


@frappe.whitelist()
def get_project_members(project: str) -> Dict[str, Any]:
    """Return project members as User records (for member picker)."""
    try:
        project = (project or "").strip()
        if not project:
            return _err("validation", _("Project is required"))

        if not frappe.has_permission("Project", "read", project):
            return _err("permission", _("Not permitted"))

        rows = frappe.get_all(
            "Project User",
            filters={"parenttype": "Project", "parentfield": "users", "parent": project},
            fields=["user"],
            limit_page_length=0,
        )
        user_ids = [r.user for r in rows if r.user]

        # Include project owner as a member candidate
        owner = frappe.db.get_value("Project", project, "owner")
        if owner and owner not in user_ids:
            user_ids.append(owner)

        if not user_ids:
            return _ok([])

        users = frappe.get_all(
            "User",
            filters={"name": ["in", user_ids]},
            fields=["name", "email", "full_name", "user_image"],
            limit_page_length=0,
        )
        users_by_name = {u.name: u for u in users}
        ordered = [users_by_name[u] for u in user_ids if u in users_by_name]

        return _ok(ordered)
    except Exception as e:
        frappe.log_error(f"Error in get_project_members: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def add_comment(task_name: str, content: str) -> Dict[str, Any]:
    """Add a comment to a task."""
    try:
        task_name = (task_name or "").strip()
        if not task_name:
            return _err("validation", _("Task name is required"))

        if not frappe.has_permission("Task", "write", task_name):
            return _err("permission", _("Not permitted"))

        content = (content or "").strip()
        if not content:
            return _err("validation", _("Comment cannot be empty"))

        # Store as safe HTML (simple text → HTML)
        safe = escape_html(content).replace("\n", "<br>")
        html = f"<p>{safe}</p>"

        doc = frappe.get_doc(
            {
                "doctype": "Comment",
                "comment_type": "Comment",
                "reference_doctype": "Task",
                "reference_name": task_name,
                "content": html,
            }
        )
        doc.insert(ignore_permissions=True)
        frappe.db.commit()

        frappe.publish_realtime(
            "sprintspace_board_update",
            {
                "project": frappe.db.get_value("Task", task_name, "project"),
                "type": "add_comment",
                "task": task_name,
            },
        )
        return _ok(
            {
                "name": doc.name,
                "comment_type": doc.comment_type,
                "comment_email": doc.comment_email,
                "comment_by": doc.comment_by,
                "creation": doc.creation,
                "content": doc.content,
                "reference_name": doc.reference_name,
            }
        )
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in add_comment: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def get_labels(project: str) -> Dict[str, Any]:
    """Get available labels for the board (Project Type) of a project."""
    try:
        project = (project or "").strip()
        if not project:
            return _err("validation", _("Project is required"))
        if not frappe.has_permission("Project", "read", project):
            return _err("permission", _("Not permitted"))

        project_type = frappe.db.get_value("Project", project, "project_type")
        if not project_type:
            return _ok([])

        labels = frappe.get_all(
            "SprintSpace Label",
            filters={"project_type": project_type},
            fields=["name", "title", "color", "project_type"],
            order_by="modified desc",
            limit_page_length=0,
        )
        return _ok(labels)
    except Exception as e:
        frappe.log_error(f"Error in get_labels: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def create_label(project: str, title: str, color: str) -> Dict[str, Any]:
    """Create a label for the project's board."""
    try:
        project = (project or "").strip()
        title = (title or "").strip()
        color = (color or "").strip()
        if not project or not title or not color:
            return _err("validation", _("Project, title and color are required"))
        if not frappe.has_permission("Project", "write", project):
            return _err("permission", _("Not permitted"))

        project_type = frappe.db.get_value("Project", project, "project_type")
        if not project_type:
            return _err("validation", _("Project Type is required for labels"))

        doc = frappe.get_doc(
            {
                "doctype": "SprintSpace Label",
                "project_type": project_type,
                "title": title,
                "color": color,
            }
        )
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return _ok({"name": doc.name, "title": doc.title, "color": doc.color, "project_type": doc.project_type})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in create_label: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def get_task_labels(task_name: str) -> Dict[str, Any]:
    """Get labels assigned to a task."""
    try:
        task_name = (task_name or "").strip()
        if not task_name:
            return _err("validation", _("Task name is required"))
        if not frappe.has_permission("Task", "read", task_name):
            return _err("permission", _("Not permitted"))

        links = frappe.get_all(
            "SprintSpace Task Label",
            filters={"task": task_name},
            fields=["label"],
            limit_page_length=0,
        )
        label_names = [l.label for l in links if l.label]
        if not label_names:
            return _ok([])

        labels = frappe.get_all(
            "SprintSpace Label",
            filters={"name": ["in", label_names]},
            fields=["name", "title", "color", "project_type"],
            limit_page_length=0,
        )
        labels_by_name = {l.name: l for l in labels}
        ordered = [labels_by_name[n] for n in label_names if n in labels_by_name]
        return _ok(ordered)
    except Exception as e:
        frappe.log_error(f"Error in get_task_labels: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def add_task_label(task_name: str, label: str) -> Dict[str, Any]:
    """Assign a label to a task."""
    try:
        task_name = (task_name or "").strip()
        label = (label or "").strip()
        if not task_name or not label:
            return _err("validation", _("Task and label are required"))
        if not frappe.has_permission("Task", "write", task_name):
            return _err("permission", _("Not permitted"))

        exists = frappe.db.exists("SprintSpace Task Label", {"task": task_name, "label": label})
        if exists:
            return _ok({"name": exists})

        doc = frappe.get_doc({"doctype": "SprintSpace Task Label", "task": task_name, "label": label})
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return _ok({"name": doc.name})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in add_task_label: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def remove_task_label(task_name: str, label: str) -> Dict[str, Any]:
    """Remove a label from a task."""
    try:
        task_name = (task_name or "").strip()
        label = (label or "").strip()
        if not task_name or not label:
            return _err("validation", _("Task and label are required"))
        if not frappe.has_permission("Task", "write", task_name):
            return _err("permission", _("Not permitted"))

        name = frappe.db.get_value("SprintSpace Task Label", {"task": task_name, "label": label}, "name")
        if not name:
            return _ok({"deleted": 0})
        frappe.delete_doc("SprintSpace Task Label", name, ignore_permissions=True)
        frappe.db.commit()
        return _ok({"deleted": 1})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in remove_task_label: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def get_checklists(task_name: str) -> Dict[str, Any]:
    """Get checklists for a task (with items)."""
    try:
        task_name = (task_name or "").strip()
        if not task_name:
            return _err("validation", _("Task name is required"))
        if not frappe.has_permission("Task", "read", task_name):
            return _err("permission", _("Not permitted"))

        names = frappe.get_all(
            "SprintSpace Checklist",
            filters={"task": task_name},
            fields=["name"],
            order_by="modified desc",
            limit_page_length=0,
        )
        result = []
        for n in names:
            doc = frappe.get_doc("SprintSpace Checklist", n.name)
            result.append(doc.as_dict())
        return _ok(result)
    except Exception as e:
        frappe.log_error(f"Error in get_checklists: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def add_checklist(task_name: str, title: str) -> Dict[str, Any]:
    """Add a checklist to a task."""
    try:
        task_name = (task_name or "").strip()
        title = (title or "").strip()
        if not task_name or not title:
            return _err("validation", _("Task and title are required"))
        if not frappe.has_permission("Task", "write", task_name):
            return _err("permission", _("Not permitted"))

        doc = frappe.get_doc({"doctype": "SprintSpace Checklist", "task": task_name, "title": title, "items": []})
        doc.insert(ignore_permissions=True)
        frappe.db.commit()
        return _ok({"name": doc.name})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in add_checklist: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def add_checklist_item(checklist: str, title: str) -> Dict[str, Any]:
    """Add an item to a checklist."""
    try:
        checklist = (checklist or "").strip()
        title = (title or "").strip()
        if not checklist or not title:
            return _err("validation", _("Checklist and title are required"))

        doc = frappe.get_doc("SprintSpace Checklist", checklist)
        if not frappe.has_permission("Task", "write", doc.task):
            return _err("permission", _("Not permitted"))

        row = doc.append("items", {"title": title, "checked": 0})
        doc.save(ignore_permissions=True)
        frappe.db.commit()
        return _ok({"name": row.name})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in add_checklist_item: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def set_checklist_item_checked(item_name: str, checked: int) -> Dict[str, Any]:
    """Toggle checklist item."""
    try:
        item_name = (item_name or "").strip()
        if not item_name:
            return _err("validation", _("Item name is required"))

        parent = frappe.db.get_value("SprintSpace Checklist Item", item_name, "parent")
        if not parent:
            return _err("not_found", _("Checklist item not found"))

        checklist = frappe.get_doc("SprintSpace Checklist", parent)
        if not frappe.has_permission("Task", "write", checklist.task):
            return _err("permission", _("Not permitted"))

        frappe.db.set_value("SprintSpace Checklist Item", item_name, "checked", cint(checked), update_modified=False)
        frappe.db.commit()
        return _ok({"name": item_name, "checked": cint(checked)})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in set_checklist_item_checked: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def delete_checklist_item(item_name: str) -> Dict[str, Any]:
    """Delete checklist item."""
    try:
        item_name = (item_name or "").strip()
        if not item_name:
            return _err("validation", _("Item name is required"))

        parent = frappe.db.get_value("SprintSpace Checklist Item", item_name, "parent")
        if not parent:
            return _ok({"deleted": 0})

        checklist = frappe.get_doc("SprintSpace Checklist", parent)
        if not frappe.has_permission("Task", "write", checklist.task):
            return _err("permission", _("Not permitted"))

        frappe.delete_doc("SprintSpace Checklist Item", item_name, ignore_permissions=True)
        frappe.db.commit()
        return _ok({"deleted": 1})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in delete_checklist_item: {str(e)}")
        return _err("server_error", str(e))

def _get_rank_for_task(task: Any) -> float:
    rank = getattr(task, "custom_kanban_rank", None)
    if rank is None:
        idx = getattr(task, "custom_kanban_index", 0) or 0
        return float(idx) * 1024.0
    return float(rank)


def _rebalance_ranks(project: str, status: str) -> None:
    """Reassign ranks in a column to restore spacing."""
    if not frappe.db.has_column("Task", "custom_kanban_rank"):
        return
    tasks = frappe.get_all(
        "Task",
        filters={"project": project, "status": status},
        fields=["name", "custom_kanban_rank", "custom_kanban_index"],
        order_by="custom_kanban_rank asc, custom_kanban_index asc",
        limit_page_length=0,
    )
    step = 1024.0
    for i, t in enumerate(tasks):
        frappe.db.set_value(
            "Task",
            t.name,
            "custom_kanban_rank",
            float(i) * step,
            update_modified=False,
        )


@frappe.whitelist()
def move_card(
    name: str,
    project: str,
    from_status: str,
    to_status: str,
    before: str = None,
    after: str = None,
) -> Dict[str, Any]:
    """Move a card and compute a new rank based on destination neighbors.

    This replaces O(N) reorders with an O(1) update in the common case.
    """
    try:
        if not frappe.db.has_column("Task", "custom_kanban_rank"):
            return _err("migration_required", _("Kanban rank is not available yet. Please run migrations."))

        if not name or not project or not to_status:
            return _err("validation", _("Missing required fields"))

        if to_status not in KANBAN_STATUSES or (from_status and from_status not in KANBAN_STATUSES):
            return _err("validation", _("Invalid status"))

        if not frappe.has_permission("Project", "read", project):
            return _err("permission", _("Not permitted"))

        if not frappe.has_permission("Task", "write", name):
            return _err("permission", _("Not permitted to update this task"))

        doc = frappe.get_doc("Task", name)
        if doc.project != project:
            return _err("validation", _("Task does not belong to this project"))

        # Resolve neighbor ranks if provided
        before_rank = None
        after_rank = None

        if before:
            before_row = frappe.db.get_value(
                "Task",
                {"name": before, "project": project, "status": to_status},
                ["custom_kanban_rank", "custom_kanban_index"],
                as_dict=True,
            )
            if before_row:
                before_rank = float(before_row.custom_kanban_rank or float(before_row.custom_kanban_index or 0) * 1024.0)

        if after:
            after_row = frappe.db.get_value(
                "Task",
                {"name": after, "project": project, "status": to_status},
                ["custom_kanban_rank", "custom_kanban_index"],
                as_dict=True,
            )
            if after_row:
                after_rank = float(after_row.custom_kanban_rank or float(after_row.custom_kanban_index or 0) * 1024.0)

        step = 1024.0
        if before_rank is None and after_rank is None:
            max_rank = frappe.db.get_value(
                "Task",
                {"project": project, "status": to_status},
                "max(custom_kanban_rank)",
            )
            if max_rank is None:
                new_rank = 0.0
            else:
                new_rank = float(max_rank) + step
        elif before_rank is None:
            new_rank = float(after_rank) - step
        elif after_rank is None:
            new_rank = float(before_rank) + step
        else:
            gap = float(after_rank) - float(before_rank)
            if gap <= 0.000001:
                _rebalance_ranks(project, to_status)
                before_rank = frappe.db.get_value("Task", before, "custom_kanban_rank") if before else None
                after_rank = frappe.db.get_value("Task", after, "custom_kanban_rank") if after else None
                if before_rank is None and after_rank is None:
                    new_rank = 0.0
                elif before_rank is None:
                    new_rank = float(after_rank) - step
                elif after_rank is None:
                    new_rank = float(before_rank) + step
                else:
                    new_rank = (float(before_rank) + float(after_rank)) / 2.0
            else:
                new_rank = (float(before_rank) + float(after_rank)) / 2.0

        doc.status = to_status
        doc.custom_kanban_rank = new_rank
        doc.save()
        frappe.db.commit()

        frappe.publish_realtime(
            "sprintspace_board_update",
            {"project": project, "type": "move_card", "task": name},
        )
        return _ok({"name": name, "status": to_status, "custom_kanban_rank": new_rank})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in move_card: {str(e)}")
        return _err("server_error", str(e))

@frappe.whitelist()
def add_card(subject, status, project):
    """
    Get the last custom kanban index for the status and increment by 1 to add a new card
    Args:
        subject (str): Task name
        status (str): Task status
        project (str): Task project
    """
    try:
        subject = (subject or "").strip()
        status = (status or "").strip()
        project = (project or "").strip()

        if not subject:
            return _err("validation", _("Subject is required"))
        if not project:
            return _err("validation", _("Project is required"))
        if status not in KANBAN_STATUSES:
            return _err("validation", _("Invalid status"))

        if not frappe.has_permission("Project", "read", project):
            return _err("permission", _("Not permitted"))

        if not (frappe.has_permission("Project", "write", project) or frappe.has_permission("Task", "create")):
            return _err("permission", _("Not permitted to create tasks"))

        custom_kanban_index = (
            frappe.db.get_value(
                "Task",
                {"project": project, "status": status},
                "max(custom_kanban_index)",
            )
            or 0
        )
        custom_kanban_rank = None
        if frappe.db.has_column("Task", "custom_kanban_rank"):
            max_rank = frappe.db.get_value(
                "Task",
                {"project": project, "status": status},
                "max(custom_kanban_rank)",
            )
            if max_rank is None:
                custom_kanban_rank = float(custom_kanban_index) * 1024.0
            else:
                custom_kanban_rank = float(max_rank) + 1024.0
        task = frappe.get_doc({
            "doctype": "Task",
            "subject": subject,
            "status": status,
            "project": project,
            "custom_kanban_index": custom_kanban_index + 1,
            **({"custom_kanban_rank": custom_kanban_rank} if custom_kanban_rank is not None else {}),
        })
        task.save()
        frappe.db.commit()
        return _ok({"name": task.name})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in add_card: {str(e)}")
        return _err("server_error", str(e))


@frappe.whitelist()
def update_card_order(tasks):
    """
    Bulk update task order and status
    Args:
        tasks (str): JSON string of task updates
        [
            {
                "name": "TASK-2023-00001",
                "status": "In Progress",
                "custom_kanban_index": 0
            }
        ]
    """
    try:
        tasks = frappe.parse_json(tasks)
        if not isinstance(tasks, list):
            return _err("validation", _("tasks must be a list"))

        for task_update in tasks:
            if not isinstance(task_update, dict) or "name" not in task_update:
                return _err("validation", _("Invalid task update payload"))

            name = task_update["name"]
            if not frappe.has_permission("Task", "write", name):
                return _err("permission", _("Not permitted to update task {0}").format(name))

            task = frappe.get_doc("Task", name)

            if "status" in task_update:
                new_status = (task_update["status"] or "").strip()
                if new_status not in KANBAN_STATUSES:
                    return _err("validation", _("Invalid status for task {0}").format(name))
                task.status = new_status

            if "custom_kanban_index" in task_update:
                task.custom_kanban_index = cint(task_update["custom_kanban_index"])

            task.save()

        frappe.db.commit()
        return _ok({"updated": len(tasks)})
    except Exception as e:
        frappe.db.rollback()
        frappe.log_error(f"Error in update_card_order: {str(e)}")
        return _err("server_error", str(e))
