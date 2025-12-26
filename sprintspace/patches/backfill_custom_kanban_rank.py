from __future__ import annotations

import frappe


def execute():
    """Backfill Task.custom_kanban_rank from Task.custom_kanban_index.

    We keep large gaps (1024) so future reorders can insert ranks between neighbors.
    """
    if not frappe.db.has_column("Task", "custom_kanban_rank"):
        return

    tasks = frappe.get_all(
        "Task",
        fields=["name", "custom_kanban_index", "custom_kanban_rank"],
        filters={"custom_kanban_rank": ["is", "not set"]},
        limit_page_length=0,
    )
    if not tasks:
        return

    step = 1024
    for t in tasks:
        idx = int(t.custom_kanban_index or 0)
        frappe.db.set_value("Task", t.name, "custom_kanban_rank", idx * step, update_modified=False)

    frappe.db.commit()



