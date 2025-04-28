from typing import Any, Dict, List

import frappe
from frappe import _
from frappe.utils import cint
from frappe.utils.caching import redis_cache

# Constants
KANBAN_LIST = [
    {"id": "Open", "icon": "🚀", "color": "#4CAF50"},
    {"id": "Working", "icon": "🛠️", "color": "#2196F3"},
    {"id": "Pending Review", "icon": "⏳", "color": "#FFC107"},
    {"id": "Overdue", "icon": "⏰", "color": "#F44336"},
    {"id": "Completed", "icon": "🎉", "color": "#9C27B0"}
]


def get_task_data(project: str, page: int = 1, page_size: int = 9999) -> List[Dict[Any, Any]]:
    """Get tasks with related data in optimized queries"""
    try:
        # Calculate pagination
        start = (page - 1) * page_size

        # Get tasks with main data
        tasks = frappe.get_all(
            "Task",
            filters={"project": project},
            fields=[
                "name", "subject", "status", "priority", "type",
                "exp_start_date", "exp_end_date", "description",
                "custom_kanban_index", "completed_by", "completed_on",
                "_assign", "creation", "modified", "project"
            ],
            order_by="custom_kanban_index asc",
            start=start,
            page_length=page_size
        )

        if not tasks:
            return []

        # Get all task names for batch queries
        task_names = [task.name for task in tasks]

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
        for attachment in attachments:
            if attachment.attached_to_name not in attachments_by_task:
                attachments_by_task[attachment.attached_to_name] = []
            attachments_by_task[attachment.attached_to_name].append(attachment)

        comments_by_task = {}
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
            task.attachments = attachments_by_task.get(task.name, [])
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
# @redis_cache(ttl=300)  # Cache for 5 minutes
def get_tasks(project: str, page: int = 1, page_size: int = 50) -> Dict[str, Any]:
    """
    Get tasks for a project with pagination and caching
    Args:
        project (str): Project name
        page (int): Page number
        page_size (int): Number of items per page
    """
    try:
        if not project:
            frappe.throw(_("Project is required"))

        if not frappe.has_permission("Project", "read", project):
            frappe.throw(_("Not permitted to view tasks"))

        # Validate pagination parameters
        page = cint(page)
        page_size = cint(page_size)
        if page < 1 or page_size < 1:
            frappe.throw(_("Invalid pagination parameters"))

        # Get tasks with all related data
        tasks = get_task_data(project, page, page_size)

        # Organize tasks by status
        tasks_by_status = {}
        for task in tasks:
            if task.status not in tasks_by_status:
                tasks_by_status[task.status] = []
            tasks_by_status[task.status].append(task)

        # Build kanban data
        kanban_data = [
            {
                "id": status["id"],
                "icon": status["icon"],
                "color": status["color"],
                "cards": tasks_by_status.get(status["id"], [])
            }
            for status in KANBAN_LIST
        ]

        # Get total count for pagination
        total_tasks = frappe.db.count("Task", {"project": project})

        # return {
        #     "status": "success",
        #     "data": kanban_data,
        #     "pagination": {
        #         "page": page,
        #         "pageSize": page_size,
        #         "total": total_tasks,
        #         "totalPages": (total_tasks + page_size - 1) // page_size
        #     },
        #     "timestamp": frappe.utils.now_datetime()
        # }
        return kanban_data

    except Exception as e:
        frappe.log_error(f"Error in get_tasks: {str(e)}")
        return {
            "status": "error",
            "message": str(e),
            "timestamp": frappe.utils.now_datetime()
        }

# @frappe.whitelist()
# def get_tasks(project):
    """
    Get tasks for a project
    Args:
        project (str): Project name
    """

    kanban_list = [
        {
            "id": "Open",
            "icon": "🚀"
        },
        {
            "id": "Working",
            "icon": "🛠️"
        },
        {
            "id": "Pending Review",
            "icon": "⏳"
        },
        {
            "id": "Overdue",
            "icon": "⏰"
        },
        {
            "id": "Completed",
            "icon": "🎉"
        }
    ]

    tasks = frappe.get_all("Task",
                           filters={"project": project},
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
                               "_assign",
                               "creation",
                               "modified",
                               "project"
                           ],
                           order_by="custom_kanban_index asc"
                           )

    # Get Attachments for each task
    for task in tasks:
        task["attachments"] = frappe.get_all("File",
                                             filters={
                                                 "attached_to_doctype": "Task",
                                                 "attached_to_name": task["name"]
                                             },
                                             fields=[
                                                 "name",
                                                 "file_name",
                                                 "file_url"
                                             ]
                                             )

    # Get Comments for each task
    for task in tasks:
        task["comments"] = frappe.get_all("Comment",
                                          filters={
                                              "reference_doctype": "Task",
                                              "reference_name": task["name"]
                                          },
                                          fields=[
                                              "name",
                                              "comment_type",
                                              "comment_email",
                                              "comment_by",
                                              "creation",
                                              "content"
                                          ],
                                          order_by="creation desc"
                                          )

    for task in tasks:
        task["users"] = []
        if task._assign:
            task._assign = frappe.parse_json(task._assign)
            for user in task._assign:
                user = frappe.db.get_value(
                    "User", user, ["email", "full_name", "user_image"], as_dict=1)
                task["users"].append(user)

    tasks_by_status = {}
    for task in tasks:
        if task.status not in tasks_by_status:
            tasks_by_status[task.status] = []
        tasks_by_status[task.status].append(task)

    kanban_data = []
    for status in kanban_list:
        kanban_data.append({
            "id": status["id"],
            "icon": status["icon"],
            "cards": tasks_by_status.get(status["id"], [])
        })

    return kanban_data


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
        custom_kanban_index = frappe.db.get_value(
            "Task", {"status": status}, "max(custom_kanban_index)") or 0
        task = frappe.get_doc({
            "doctype": "Task",
            "subject": subject,
            "status": status,
            "project": project,
            "custom_kanban_index": custom_kanban_index + 1
        })
        task.save()
        frappe.db.commit()
        return {"message": "Task added successfully"}
    except Exception as e:
        frappe.db.rollback()
        frappe.throw(str(e))


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
        for task_update in tasks:
            task = frappe.get_doc("Task", task_update["name"])
            if "status" in task_update:
                task.status = task_update["status"]
            if "custom_kanban_index" in task_update:
                task.custom_kanban_index = task_update["custom_kanban_index"]
            task.save()

        frappe.db.commit()
        return {"message": "Tasks updated successfully"}
    except Exception as e:
        frappe.db.rollback()
        frappe.throw(str(e))
