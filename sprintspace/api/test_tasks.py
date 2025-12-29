import frappe
from frappe.tests.utils import FrappeTestCase
from sprintspace.api.tasks import add_card, get_tasks, update_card_order


class TestTasksAPI(FrappeTestCase):
    def setUp(self):
        """Set up test fixtures"""
        self.project = frappe.get_doc({
            "doctype": "Project",
            "project_name": "Test Project TDD",
            "status": "Open"
        }).insert()
        frappe.db.commit()

    def tearDown(self):
        """Clean up after tests"""
        # Delete test tasks
        frappe.db.delete("Task", {"project": self.project.name})
        # Delete test project
        frappe.delete_doc("Project", self.project.name, force=1)
        frappe.db.commit()

    def test_add_card_creates_task(self):
        """Test that add_card creates a task"""
        result = add_card(
            subject="Test Task",
            status="Open",
            project=self.project.name
        )

        self.assertEqual(result["message"], "Task added successfully")

        # Verify task was created
        tasks = frappe.get_all("Task", filters={"project": self.project.name})
        self.assertEqual(len(tasks), 1)

    def test_add_card_validates_empty_subject(self):
        """Test that empty subject is rejected"""
        with self.assertRaises(Exception):
            add_card(subject="", status="Open", project=self.project.name)

    def test_get_tasks_returns_kanban_structure(self):
        """Test that get_tasks returns proper kanban structure"""
        # Create test tasks
        add_card("Task 1", "Open", self.project.name)
        add_card("Task 2", "Working", self.project.name)

        result = get_tasks(project=self.project.name)

        # Should be a list
        self.assertIsInstance(result, list)
        # Should have all status columns
        self.assertEqual(len(result), 5)
        # Should contain our tasks
        all_tasks = []
        for column in result:
            all_tasks.extend(column['cards'])
        self.assertEqual(len(all_tasks), 2)

    def test_update_card_order_updates_index(self):
        """Test that update_card_order updates kanban index"""
        # Create a task
        add_card("Test Task", "Open", self.project.name)

        # Get the task
        task = frappe.get_last_doc("Task")

        # Update its position
        updates = [{
            "name": task.name,
            "custom_kanban_index": 5
        }]

        result = update_card_order(frappe.as_json(updates))

        self.assertEqual(result["message"], "Tasks updated successfully")

        # Verify the update
        updated_task = frappe.get_doc("Task", task.name)
        self.assertEqual(updated_task.custom_kanban_index, 5)

    def test_update_card_order_changes_status(self):
        """Test that update_card_order can change task status"""
        # Create a task
        add_card("Test Task", "Open", self.project.name)

        # Get the task
        task = frappe.get_last_doc("Task")

        # Update its status
        updates = [{
            "name": task.name,
            "status": "Working",
            "custom_kanban_index": 0
        }]

        update_card_order(frappe.as_json(updates))

        # Verify the update
        updated_task = frappe.get_doc("Task", task.name)
        self.assertEqual(updated_task.status, "Working")

    def test_add_card_rejects_empty_subject(self):
        """Test that empty subject throws error"""
        with self.assertRaises(frappe.ValidationError):
            add_card(subject="", status="Open", project=self.project.name)

    def test_add_card_rejects_whitespace_subject(self):
        """Test that whitespace-only subject throws error"""
        with self.assertRaises(frappe.ValidationError):
            add_card(subject="   ", status="Open", project=self.project.name)

    def test_add_card_rejects_invalid_status(self):
        """Test that invalid status throws error"""
        with self.assertRaises(frappe.ValidationError):
            add_card(subject="Test", status="InvalidStatus",
                     project=self.project.name)

    def test_add_card_sanitizes_html(self):
        """Test that HTML is stripped from subject"""
        result = add_card(
            subject="<script>alert('xss')</script>Test Task",
            status="Open",
            project=self.project.name
        )

        # Verify task was created
        task = frappe.get_last_doc("Task")
        # Subject should not contain HTML tags
        self.assertNotIn("<script>", task.subject)
        self.assertIn("Test Task", task.subject)

    def test_get_tasks_validates_project(self):
        """Test that get_tasks validates project parameter"""
        with self.assertRaises(Exception):
            get_tasks(project="")

    def test_update_card_order_validates_task_exists(self):
        """Test that update_card_order validates task exists"""
        updates = [{
            "name": "NONEXISTENT-TASK",
            "custom_kanban_index": 0
        }]

        with self.assertRaises(Exception):
            update_card_order(frappe.as_json(updates))
