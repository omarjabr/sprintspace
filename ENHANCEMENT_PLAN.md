# SprintSpace Enhancement Plan

## Comprehensive Code Review & Improvement Roadmap

**Date**: December 28, 2025  
**Project**: SprintSpace - Trello Clone for ERPNext  
**Tech Stack**: Frappe/ERPNext + React + TypeScript + TailwindCSS

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Critical Issues & Enhancements](#critical-issues--enhancements)
4. [Component-Level Improvements](#component-level-improvements)
5. [Backend API Enhancements](#backend-api-enhancements)
6. [State Management & Performance](#state-management--performance)
7. [UI/UX & Accessibility](#uiux--accessibility)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Implementation Priority](#implementation-priority)

---

## Executive Summary

SprintSpace is a functional Trello clone built on top of ERPNext's Project and Task doctypes. The application demonstrates solid foundational architecture but requires several enhancements to achieve production-grade robustness and match Trello's user experience standards.

### Current State

- ✅ Core drag-and-drop kanban functionality works
- ✅ Task CRUD operations implemented
- ✅ Integration with ERPNext doctypes
- ✅ Modern React frontend with TypeScript
- ✅ Rich text editing for descriptions
- ⚠️ Missing error boundaries and proper error handling
- ⚠️ No optimistic UI updates
- ⚠️ Incomplete filtering implementation
- ⚠️ Performance issues with large datasets
- ⚠️ Limited accessibility features
- ⚠️ No real-time collaboration features

---

## Current Architecture Analysis

### Frontend Structure

```
frontend/src/
├── components/
│   ├── common/          # Shared components (cards, popovers, modals)
│   ├── forms/           # Form components
│   ├── layout/          # Layout components
│   ├── modals/          # Modal dialogs
│   ├── providers/       # Context providers
│   ├── rich-text/       # TipTap editor components
│   └── ui/              # Shadcn UI components
├── hooks/               # Custom React hooks
├── pages/               # Route pages
├── utils/               # Utility functions
└── types.ts             # TypeScript definitions
```

### Backend Structure

```
sprintspace/
├── api/
│   └── tasks.py         # API endpoints for task operations
├── sprintspace/
│   └── custom/          # DocType customizations
│       ├── task.json
│       ├── project.json
│       └── project_type.json
└── hooks.py             # Frappe hooks configuration
```

### Key Dependencies

- **Frontend**: React 18, TypeScript, Vite, Frappe React SDK, Zustand, TailwindCSS, Radix UI, TipTap, @hello-pangea/dnd
- **Backend**: Frappe Framework, ERPNext

---

## Critical Issues & Enhancements

### 🔴 CRITICAL (Must Fix)

#### 1. Error Handling & Error Boundaries

**Current State**: Minimal error handling; no error boundaries
**Impact**: Application crashes on errors, poor user experience

**Issues Found**:

- No error boundaries wrapping components
- Console.error only - no user feedback
- No recovery mechanisms
- API errors not properly handled

**Required Actions**:

```typescript
// Add Error Boundary component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

**Files to Update**:

- Create: `frontend/src/components/error-boundary.tsx`
- Update: `frontend/src/App.tsx` (wrap routes with ErrorBoundary)
- Update: All API call locations with try-catch and user notifications

---

#### 2. Optimistic UI Updates

**Current State**: All operations wait for server response
**Impact**: Laggy user experience, doesn't feel like Trello

**Issues Found**:

- Drag and drop waits for server before updating UI
- Card creation shows no immediate feedback
- No rollback mechanism on failures

**Required Actions**:

```typescript
// Implement optimistic updates pattern
const onDragEnd = async (result: any) => {
  // 1. Update UI immediately
  setOrderedData(newOrderedData);

  try {
    // 2. Send to server
    await updateCardOrder({ tasks: updates });
    // 3. Revalidate from server
    mutate();
  } catch (error) {
    // 4. Rollback on error
    setOrderedData(originalData);
    showErrorToast("Failed to update task order");
  }
};
```

**Files to Update**:

- `frontend/src/components/list-container.tsx`
- `frontend/src/components/card-form.tsx`
- All modal components that update data

---

#### 3. Loading States & Skeletons

**Current State**: Simple "Loading..." text
**Impact**: Unprofessional appearance, no visual feedback

**Required Actions**:

- Create skeleton loaders for cards, lists, and boards
- Add loading states to all buttons
- Implement progressive loading for large datasets
- Add shimmer effects

**Files to Create**:

- `frontend/src/components/ui/skeleton.tsx`
- `frontend/src/components/skeletons/card-skeleton.tsx`
- `frontend/src/components/skeletons/list-skeleton.tsx`

---

#### 4. Toast Notifications System

**Current State**: No user feedback for actions
**Impact**: Users don't know if actions succeeded or failed

**Required Actions**:

```typescript
// Implement toast notification system
import { toast } from "sonner";

// Success notifications
toast.success("Task created successfully");
toast.success("Task moved to Completed");

// Error notifications
toast.error("Failed to update task");
toast.error("Network error. Please try again.");

// Loading notifications
const toastId = toast.loading("Creating task...");
toast.success("Task created!", { id: toastId });
```

**Files to Update**:

- Add dependency: `sonner` or `react-hot-toast`
- Update: All API call locations
- Create: Toast configuration component

---

### 🟡 HIGH PRIORITY (Should Fix Soon)

#### 5. Filter Implementation Issues

**Current State**: Filter UI exists but doesn't properly trigger refetch
**Impact**: Filters don't work as expected

**Issues Found** in `ProjectKanban.tsx`:

```typescript
// ❌ Problem: useFrappeGetCall doesn't re-fetch when filters change
const {
  data: board,
  isLoading: isTasksLoading,
  mutate: mutateTasks,
} = useFrappeGetCall<...>("sprintspace.api.tasks.get_tasks", {
  project: id,
  filters: JSON.stringify(filters) // This doesn't trigger refetch
});

// ❌ Problem: mutate() doesn't send new filters
const handleFilterChange = (newFilters: TaskFilters) => {
  setFilters(newFilters);
  mutateTasks(); // This just refetches with old params
};
```

**Correct Implementation**:

```typescript
// ✅ Solution: Use useFrappePostCall for dynamic queries
const { call: getTasks } = useFrappePostCall<...>("sprintspace.api.tasks.get_tasks");
const [boardData, setBoardData] = useState(null);
const [isLoading, setIsLoading] = useState(false);

const fetchTasks = async (filterParams: TaskFilters) => {
  setIsLoading(true);
  try {
    const response = await getTasks({
      project: id,
      filters: JSON.stringify(filterParams)
    });
    setBoardData(response);
  } catch (error) {
    showErrorToast("Failed to load tasks");
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  fetchTasks(filters);
}, [filters, id]);
```

**Files to Update**:

- `frontend/src/pages/ProjectKanban.tsx`
- `frontend/src/components/filter-dialog.tsx`

---

#### 6. Drag and Drop Performance

**Current State**: Updates all cards in both lists on move
**Impact**: Slow performance with many cards

**Issues Found** in `list-container.tsx`:

```typescript
// ❌ Problem: Updates ALL cards in both source and destination
destList.cards.forEach((card, index) => {
  if (card.name !== movedCard.name) {
    updates.push({
      name: card.name,
      custom_kanban_index: index,
    });
  }
});
```

**Optimized Implementation**:

```typescript
// ✅ Only update moved card and adjacent cards
if (source.droppableId === destination.droppableId) {
  // Same list: only update cards between source and destination
  const start = Math.min(source.index, destination.index);
  const end = Math.max(source.index, destination.index);

  reorderedCards.slice(start, end + 1).forEach((card, idx) => {
    updates.push({
      name: card.name,
      custom_kanban_index: start + idx,
    });
  });
} else {
  // Different lists: only update moved card
  updates.push({
    name: movedCard.name,
    status: destination.droppableId,
    custom_kanban_index: destination.index,
  });
}
```

**Files to Update**:

- `frontend/src/components/list-container.tsx`

---

#### 7. Memory Leaks & Cleanup

**Current State**: No cleanup in useEffect hooks
**Impact**: Memory leaks, potential crashes

**Issues Found**:

- No abort controllers for API calls
- Event listeners not cleaned up
- Subscriptions not unsubscribed

**Required Actions**:

```typescript
// Add cleanup for API calls
useEffect(() => {
  const abortController = new AbortController();

  fetchData({ signal: abortController.signal });

  return () => {
    abortController.abort();
  };
}, [dependencies]);

// Add cleanup for event listeners
useEffect(() => {
  const handleKeyDown = (e) => {
    /* ... */
  };
  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}, []);
```

**Files to Update**:

- All components with useEffect hooks
- All components making API calls

---

#### 8. Type Safety Improvements

**Current State**: Many 'any' types, incomplete type definitions
**Impact**: Runtime errors, poor developer experience

**Issues Found**:

```typescript
// ❌ Found in list-container.tsx
const onDragEnd = async (result: any) => { // Should be DropResult

// ❌ Found in modal-status-bar.tsx
const updates: any[] = []; // Should be TaskUpdate[]
```

**Required Actions**:

```typescript
// ✅ Create proper types
interface DropResult {
  destination: { droppableId: string; index: number } | null;
  source: { droppableId: string; index: number };
  draggableId: string;
}

interface TaskUpdate {
  name: string;
  status?: string;
  custom_kanban_index?: number;
}
```

**Files to Update**:

- `frontend/src/types.ts` (add all missing types)
- All components using 'any' type

---

#### 9. Data Validation & Sanitization

**Current State**: No client-side validation before API calls
**Impact**: Unnecessary API calls, poor UX

**Required Actions**:

```typescript
// Add Zod schemas for validation
import { z } from "zod";

const TaskSchema = z.object({
  subject: z.string().min(1, "Title is required").max(255),
  status: z.enum(["Open", "Working", "Pending Review", "Overdue", "Completed"]),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]),
  exp_end_date: z.string().optional(),
});

// Use in forms
const onSubmit = (data: FormData) => {
  const validated = TaskSchema.safeParse(data);
  if (!validated.success) {
    toast.error(validated.error.errors[0].message);
    return;
  }
  // Proceed with API call
};
```

**Files to Update**:

- Create: `frontend/src/schema/task-schema.ts`
- Update: All form submission handlers

---

### 🟢 MEDIUM PRIORITY (Should Improve)

#### 10. Keyboard Shortcuts (Trello-like)

**Current State**: No keyboard shortcuts
**Impact**: Power users can't navigate efficiently

**Required Shortcuts**:

- `N` - New card
- `Q` - Quick card add
- `F` - Open filters
- `Esc` - Close modals
- `Ctrl+Enter` - Save and close
- `/` - Search
- Arrow keys - Navigate between cards

**Implementation**:

```typescript
// Create keyboard shortcuts hook
const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key.toLowerCase()) {
        case "n":
          openNewCardModal();
          break;
        case "f":
          openFilters();
          break;
        case "/":
          focusSearch();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, []);
};
```

**Files to Create**:

- `frontend/src/hooks/use-keyboard-shortcuts.tsx`

---

#### 11. Card Labels & Tags

**Current State**: Only type and priority badges
**Impact**: Limited categorization options

**Required Actions**:

- Add custom labels/tags to tasks
- Color-coded labels
- Quick label assignment
- Filter by labels

**Files to Update**:

- Backend: Add custom field to Task doctype
- `frontend/src/components/common/task-card.tsx`
- Create: `frontend/src/components/common/label-manager.tsx`

---

#### 12. Search Functionality

**Current State**: No search feature
**Impact**: Difficult to find tasks in large projects

**Required Actions**:

```typescript
// Add search to project navbar
const [searchQuery, setSearchQuery] = useState("");
const [searchResults, setSearchResults] = useState<Task[]>([]);

const handleSearch = async (query: string) => {
  if (query.length < 2) return;

  const results = await searchTasks({
    project: projectId,
    query: query,
  });

  setSearchResults(results);
};
```

**Files to Update**:

- `frontend/src/components/project-navbar.tsx`
- Backend: Create search API endpoint

---

#### 13. Undo/Redo Functionality

**Current State**: No undo capability
**Impact**: Mistakes are permanent

**Required Actions**:

```typescript
// Implement command pattern for undo/redo
interface Command {
  execute: () => Promise<void>;
  undo: () => Promise<void>;
}

class MoveCardCommand implements Command {
  constructor(
    private task: Task,
    private fromStatus: string,
    private toStatus: string,
    private fromIndex: number,
    private toIndex: number
  ) {}

  async execute() {
    await updateTask(this.task.name, {
      status: this.toStatus,
      custom_kanban_index: this.toIndex,
    });
  }

  async undo() {
    await updateTask(this.task.name, {
      status: this.fromStatus,
      custom_kanban_index: this.fromIndex,
    });
  }
}
```

**Files to Create**:

- `frontend/src/utils/command-manager.ts`
- `frontend/src/hooks/use-undo-redo.tsx`

---

#### 14. Card Cover Images

**Current State**: No visual appeal on cards
**Impact**: Less engaging UI compared to Trello

**Required Actions**:

- Add cover image to tasks
- Unsplash integration for stock photos
- Upload custom images
- Color gradient covers

**Files to Update**:

- Backend: Add cover_image field to Task
- `frontend/src/components/common/task-card.tsx`
- Create: `frontend/src/components/common/cover-picker.tsx`

---

#### 15. Due Date Reminders

**Current State**: Static due dates, no reminders
**Impact**: Users miss deadlines

**Required Actions**:

- Browser notifications for upcoming due dates
- Email notifications (via Frappe)
- Visual indicators for urgent tasks
- Custom reminder times

**Files to Create**:

- `frontend/src/hooks/use-notifications.tsx`
- Backend: Scheduled task for reminder emails

---

#### 16. Activity Feed Improvements

**Current State**: Basic activity display in modal
**Impact**: Hard to track changes

**Issues Found** in `modal-activity.tsx`:

```typescript
// ❌ Hardcoded name
<p className="font-bold">Omar</p>

// ❌ No proper comment type handling
// ❌ Limited activity types
```

**Required Actions**:

- Show user who made the change
- Better formatting for different activity types
- Collapsible activity groups
- Filter activities by type
- Export activity log

**Files to Update**:

- `frontend/src/components/common/modal-activity.tsx`

---

### 🔵 LOW PRIORITY (Nice to Have)

#### 17. Bulk Operations

**Current State**: One card at a time
**Impact**: Time-consuming for bulk changes

**Required Features**:

- Multi-select cards (Ctrl+Click)
- Bulk move to status
- Bulk assign users
- Bulk delete
- Bulk change priority

---

#### 18. Card Templates

**Current State**: Create from scratch each time
**Impact**: Repetitive for similar tasks

**Required Features**:

- Save card as template
- Template library
- Quick create from template
- Template variables

---

#### 19. Board Templates

**Current State**: Manual project setup
**Impact**: Time-consuming onboarding

**Required Features**:

- Predefined board templates
- Industry-specific templates
- Clone existing boards
- Share templates

---

#### 20. Custom Fields

**Current State**: Fixed task fields
**Impact**: Limited customization

**Required Features**:

- Add custom fields to tasks
- Different field types (text, number, date, select)
- Show/hide custom fields
- Custom field in filters

---

#### 21. Time Tracking

**Current State**: Only estimated/actual time
**Impact**: Poor time management

**Required Features**:

- Start/stop timer on cards
- Manual time entry
- Time reports
- Billable hours tracking

---

#### 22. Dependencies & Blockers

**Current State**: Basic "depends on" field
**Impact**: Can't visualize task relationships

**Required Features**:

- Visual dependency links
- Blocker indicators
- Dependency chain view
- Auto-notifications when blocker resolved

---

## Component-Level Improvements

### TaskCard Component

**File**: `frontend/src/components/common/task-card.tsx`

**Issues**:

1. ❌ Missing key prop in Avatar map (line 108)
2. ⚠️ No loading state during actions
3. ⚠️ No accessibility labels
4. ⚠️ Hardcoded colors should use theme

**Improvements**:

```typescript
// ✅ Add proper keys
{task?.users?.map((user) => (
  <Avatar key={user.name} />
))}

// ✅ Add accessibility
<div
  role="button"
  aria-label={`Open task: ${task.subject}`}
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && cardModal.onOpen(task, mutate)}
>

// ✅ Use theme colors
className={cn(
  "text-xs px-2 py-0 rounded-sm",
  "bg-primary text-primary-foreground"
)}
```

---

### ListContainer Component

**File**: `frontend/src/components/list-container.tsx`

**Issues**:

1. ❌ No error handling for drag failures
2. ⚠️ Updates too many cards unnecessarily
3. ⚠️ No loading state during reorder
4. ⚠️ Re-sorts on every data change (performance)

**Improvements**:

```typescript
// ✅ Memoize sorted data
const sortedData = useMemo(() => {
  return data.map((list) => ({
    ...list,
    cards: [...list.cards].sort(
      (a, b) => (a.custom_kanban_index || 0) - (b.custom_kanban_index || 0)
    ),
  }));
}, [data]);

// ✅ Add loading overlay during drag save
{
  loading && <LoadingOverlay />;
}

// ✅ Batch updates efficiently
const updates = calculateMinimalUpdates(
  sourceList.cards,
  destList.cards,
  movedCard
);
```

---

### ModalStatusBar Component

**File**: `frontend/src/components/common/modal-status-bar.tsx`

**Issues**:

1. ❌ No error handling for assign/unassign
2. ⚠️ Redundant state management
3. ⚠️ Multiple API calls for related updates
4. ⚠️ No optimistic updates

**Improvements**:

```typescript
// ✅ Optimistic UI updates
const handleAssignUser = async (user: TaskUser) => {
  // Update UI immediately
  setUsers({
    cardUsers: [...users.cardUsers, user],
    users: users.users.filter((u) => u.name !== user.name),
  });

  try {
    await assignUser({
      doctype: "Task",
      name: data.name,
      assign_to: [user.name],
    });
  } catch (error) {
    // Rollback on error
    setUsers(originalUsers);
    toast.error("Failed to assign user");
  } finally {
    mutate();
  }
};

// ✅ Batch related updates
const handleBulkUpdate = async (updates: Partial<Task>) => {
  await updateTask(data.name, updates);
  mutate();
};
```

---

### FilterDialog Component

**File**: `frontend/src/components/filter-dialog.tsx`

**Issues**:

1. ⚠️ No "clear all filters" button
2. ⚠️ No active filter count indicator
3. ⚠️ Filter state not persisted
4. ⚠️ No filter presets

**Improvements**:

```typescript
// ✅ Add clear filters button
<Button
  variant="outline"
  onClick={() => {
    handleFilterChange({
      status: [],
      priority: [],
      type: [],
      assignedTo: [],
      dateRange: {}
    });
  }}
>
  Clear All Filters
</Button>

// ✅ Show active filter count
<Badge>{getActiveFilterCount(filters)}</Badge>

// ✅ Persist filters to localStorage
useEffect(() => {
  localStorage.setItem(`filters-${projectId}`, JSON.stringify(filters));
}, [filters, projectId]);
```

---

## Backend API Enhancements

### Current API: sprintspace/api/tasks.py

#### Issues Found:

**1. Inconsistent Error Responses**

```python
# ❌ Sometimes returns dict, sometimes returns list
def get_tasks(...):
    try:
        return kanban_data  # list
    except Exception as e:
        return {  # dict
            "status": "error",
            "message": str(e)
        }
```

**Solution**:

```python
# ✅ Always return consistent structure
def get_tasks(...):
    try:
        return {
            "status": "success",
            "data": kanban_data,
            "pagination": {...}
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "data": None
        }
```

---

**2. No Input Validation**

```python
# ❌ No validation
@frappe.whitelist()
def add_card(subject, status, project):
    task = frappe.get_doc({
        "doctype": "Task",
        "subject": subject,  # What if subject is empty?
        "status": status,     # What if status is invalid?
        "project": project    # What if project doesn't exist?
    })
```

**Solution**:

```python
# ✅ Add validation
@frappe.whitelist()
def add_card(subject, status, project):
    # Validate inputs
    if not subject or not subject.strip():
        frappe.throw(_("Task subject is required"))

    if status not in ["Open", "Working", "Pending Review", "Overdue", "Completed"]:
        frappe.throw(_("Invalid status"))

    if not frappe.db.exists("Project", project):
        frappe.throw(_("Project not found"))

    # Validate permissions
    if not frappe.has_permission("Project", "write", project):
        frappe.throw(_("No permission to add tasks to this project"))

    # Sanitize inputs
    subject = frappe.utils.strip_html_tags(subject).strip()

    # Continue with creation...
```

---

**3. N+1 Query Problem**

```python
# ❌ Current implementation has good batching,
# but could be better with joins
attachments = frappe.get_all("File", ...)
comments = frappe.get_all("Comment", ...)
users = frappe.get_all("User", ...)

# Multiple queries executed
```

**Solution**:

```python
# ✅ Use SQL joins for better performance
tasks_with_data = frappe.db.sql("""
    SELECT
        t.*,
        GROUP_CONCAT(DISTINCT f.file_url) as attachment_urls,
        GROUP_CONCAT(DISTINCT u.full_name) as assigned_users,
        COUNT(DISTINCT c.name) as comment_count
    FROM `tabTask` t
    LEFT JOIN `tabFile` f ON f.attached_to_name = t.name
    LEFT JOIN `tabUser` u ON u.name IN (t._assign)
    LEFT JOIN `tabComment` c ON c.reference_name = t.name
    WHERE t.project = %(project)s
    GROUP BY t.name
    ORDER BY t.custom_kanban_index ASC
""", {"project": project}, as_dict=True)
```

---

**4. Missing Rate Limiting**

```python
# ❌ No protection against abuse
@frappe.whitelist()
def update_card_order(tasks):
    # Could be called 100 times per second
```

**Solution**:

```python
# ✅ Add rate limiting decorator
from functools import wraps
import time

def rate_limit(max_calls=10, time_window=60):
    calls = {}

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            user = frappe.session.user
            now = time.time()

            if user not in calls:
                calls[user] = []

            # Remove old calls
            calls[user] = [t for t in calls[user] if now - t < time_window]

            if len(calls[user]) >= max_calls:
                frappe.throw(_("Rate limit exceeded. Please try again later."))

            calls[user].append(now)
            return func(*args, **kwargs)

        return wrapper
    return decorator

@frappe.whitelist()
@rate_limit(max_calls=30, time_window=60)
def update_card_order(tasks):
    # Protected against abuse
```

---

**5. No Caching**

```python
# ❌ Queries database on every request
def get_tasks(project, ...):
    tasks = frappe.get_all("Task", ...)
    # Same data fetched repeatedly
```

**Solution**:

```python
# ✅ Add Redis caching
@frappe.whitelist()
def get_tasks(project, page=1, page_size=9999, filters=None):
    cache_key = f"tasks:{project}:{page}:{page_size}:{filters}"

    # Try cache first
    cached_data = frappe.cache().get(cache_key)
    if cached_data:
        return cached_data

    # Fetch from database
    data = get_task_data(project, page, page_size, filters)

    # Cache for 5 minutes
    frappe.cache().setex(cache_key, 300, data)

    return data

# Invalidate cache on updates
@frappe.whitelist()
def update_card_order(tasks):
    # Update tasks...

    # Clear cache
    project = frappe.db.get_value("Task", tasks[0]["name"], "project")
    frappe.cache().delete_keys(f"tasks:{project}:*")
```

---

**6. Missing Audit Trail**

```python
# ❌ No tracking of who changed what
def update_card_order(tasks):
    task.status = task_update["status"]
    task.save()
    # No record of who moved the card
```

**Solution**:

```python
# ✅ Add audit logging
def update_card_order(tasks):
    for task_update in tasks:
        task = frappe.get_doc("Task", task_update["name"])

        # Log changes
        if "status" in task_update and task.status != task_update["status"]:
            log_task_change(
                task=task.name,
                field="status",
                old_value=task.status,
                new_value=task_update["status"],
                user=frappe.session.user
            )

        task.status = task_update["status"]
        task.custom_kanban_index = task_update["custom_kanban_index"]
        task.save()
```

---

### New API Endpoints Needed

#### 1. Search Tasks

```python
@frappe.whitelist()
def search_tasks(project, query, limit=20):
    """
    Search tasks in a project
    """
    if not query or len(query) < 2:
        return []

    tasks = frappe.get_all(
        "Task",
        filters={
            "project": project,
            "subject": ["like", f"%{query}%"]
        },
        fields=["name", "subject", "status", "priority"],
        limit=limit
    )

    return tasks
```

---

#### 2. Bulk Update Tasks

```python
@frappe.whitelist()
def bulk_update_tasks(task_names, updates):
    """
    Update multiple tasks at once
    """
    task_names = frappe.parse_json(task_names)
    updates = frappe.parse_json(updates)

    # Validate permissions
    for task_name in task_names:
        if not frappe.has_permission("Task", "write", task_name):
            frappe.throw(_("No permission to update task {0}").format(task_name))

    # Update in bulk
    for task_name in task_names:
        task = frappe.get_doc("Task", task_name)
        for key, value in updates.items():
            task.set(key, value)
        task.save()

    frappe.db.commit()
    return {"message": _("Updated {0} tasks").format(len(task_names))}
```

---

#### 3. Get Task Statistics

```python
@frappe.whitelist()
def get_task_statistics(project):
    """
    Get statistics for project dashboard
    """
    stats = frappe.db.sql("""
        SELECT
            status,
            priority,
            COUNT(*) as count,
            AVG(DATEDIFF(act_end_date, act_start_date)) as avg_duration
        FROM `tabTask`
        WHERE project = %(project)s
        GROUP BY status, priority
    """, {"project": project}, as_dict=True)

    return {
        "total_tasks": sum(s["count"] for s in stats),
        "by_status": {...},
        "by_priority": {...},
        "completion_rate": ...,
    }
```

---

## State Management & Performance

### Current State Management

- **Zustand** for modal state (good!)
- **React state** for component state
- **SWR** (via frappe-react-sdk) for server state

### Issues:

1. ⚠️ No global state for filters
2. ⚠️ Prop drilling in some components
3. ⚠️ No state persistence
4. ⚠️ Unnecessary re-renders

### Improvements:

#### 1. Add Global Filter Store

```typescript
// Create: frontend/src/stores/filter-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterStore {
  filters: Record<string, TaskFilters>;
  setFilters: (projectId: string, filters: TaskFilters) => void;
  clearFilters: (projectId: string) => void;
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      filters: {},
      setFilters: (projectId, filters) =>
        set((state) => ({
          filters: { ...state.filters, [projectId]: filters },
        })),
      clearFilters: (projectId) =>
        set((state) => {
          const { [projectId]: _, ...rest } = state.filters;
          return { filters: rest };
        }),
    }),
    {
      name: "sprintspace-filters",
    }
  )
);
```

---

#### 2. Optimize Re-renders with React.memo

```typescript
// Memoize expensive components
export const TaskCard = React.memo(
  ({ task, index, mutate }: TaskCardProps) => {
    // Component implementation
  },
  (prevProps, nextProps) => {
    // Custom comparison
    return (
      prevProps.task.name === nextProps.task.name &&
      prevProps.task.modified === nextProps.task.modified &&
      prevProps.index === nextProps.index
    );
  }
);
```

---

#### 3. Use React Query for Better Caching

```typescript
// Consider migrating from SWR to React Query
import { useQuery } from "@tanstack/react-query";

const useTasks = (projectId: string, filters: TaskFilters) => {
  return useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: () => getTasks(projectId, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
};
```

---

## UI/UX & Accessibility

### Current Issues:

1. ❌ **No keyboard navigation**
2. ❌ **Missing ARIA labels**
3. ❌ **No focus management**
4. ❌ **Poor color contrast in some areas**
5. ⚠️ **No screen reader support**
6. ⚠️ **Modal focus trap not implemented**

### Required Improvements:

#### 1. Keyboard Navigation

```typescript
// Add keyboard navigation to kanban board
const handleKeyNavigation = (e: KeyboardEvent) => {
  const currentCard = document.activeElement;

  switch (e.key) {
    case "ArrowRight":
      focusNextCard("horizontal");
      break;
    case "ArrowLeft":
      focusPreviousCard("horizontal");
      break;
    case "ArrowDown":
      focusNextCard("vertical");
      break;
    case "ArrowUp":
      focusPreviousCard("vertical");
      break;
    case "Enter":
    case " ":
      openCard();
      break;
  }
};
```

---

#### 2. ARIA Labels

```typescript
// Add proper ARIA attributes
<div
  role="button"
  aria-label={`${task.subject}. Priority: ${task.priority}. Status: ${task.status}`}
  aria-describedby={`task-${task.name}-details`}
  tabIndex={0}
>
  <div id={`task-${task.name}-details`} className="sr-only">
    {task.description}
  </div>
</div>
```

---

#### 3. Focus Management

```typescript
// Trap focus in modals
import { FocusTrap } from "@headlessui/react";

export function TaskModal() {
  return (
    <FocusTrap>
      <DialogContent>{/* Modal content */}</DialogContent>
    </FocusTrap>
  );
}

// Return focus to trigger after modal closes
const handleClose = () => {
  onClose();
  triggerRef.current?.focus();
};
```

---

#### 4. Color Contrast

```typescript
// Ensure WCAG AA compliance
const setPriorityColor = (priority: string) => {
  switch (priority) {
    case "Low":
      return "bg-blue-100 text-blue-900"; // Improved contrast
    case "Medium":
      return "bg-green-100 text-green-900";
    case "High":
      return "bg-yellow-100 text-yellow-900";
    case "Urgent":
      return "bg-red-100 text-red-900";
  }
};
```

---

#### 5. Screen Reader Announcements

```typescript
// Add live region for dynamic updates
import { LiveAnnouncer } from "@react-aria/live-announcer";

const announcer = new LiveAnnouncer();

// Announce changes
const onDragEnd = (result) => {
  // ... drag logic ...
  announcer.announce(
    `Moved ${task.subject} to ${destination.droppableId}`,
    "polite"
  );
};
```

---

## Testing & Quality Assurance

### Current State: No Tests ❌

### Required Testing Infrastructure:

#### 1. Unit Tests (Vitest)

```typescript
// Example: list-container.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ListContainer from "./list-container";

describe("ListContainer", () => {
  it("renders all lists", () => {
    const mockData = [
      { id: "Open", icon: "🚀", cards: [] },
      { id: "Working", icon: "🛠️", cards: [] },
    ];

    render(<ListContainer data={mockData} mutate={() => {}} />);

    expect(screen.getByText("🚀 Open")).toBeInTheDocument();
    expect(screen.getByText("🛠️ Working")).toBeInTheDocument();
  });

  it("handles drag and drop", async () => {
    // Test drag and drop logic
  });
});
```

---

#### 2. Integration Tests (React Testing Library)

```typescript
// Example: task-modal.test.tsx
describe("TaskModal", () => {
  it("updates task on save", async () => {
    const mockTask = {
      /* ... */
    };
    const mockMutate = vi.fn();

    render(<TaskModal task={mockTask} mutate={mockMutate} />);

    // Edit description
    const descriptionField = screen.getByRole("textbox", {
      name: /description/i,
    });
    await userEvent.type(descriptionField, "New description");

    // Save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await userEvent.click(saveButton);

    // Assert API was called
    expect(mockMutate).toHaveBeenCalled();
  });
});
```

---

#### 3. E2E Tests (Playwright)

```typescript
// Example: kanban-board.spec.ts
import { test, expect } from "@playwright/test";

test("create and move task", async ({ page }) => {
  // Login
  await page.goto("/login");
  await page.fill('[name="username"]', "test@example.com");
  await page.fill('[name="password"]', "password");
  await page.click('button[type="submit"]');

  // Navigate to project
  await page.goto("/projects/TEST-PROJECT");

  // Create task
  await page.click('button:has-text("Add a card")');
  await page.fill('[name="subject"]', "New Test Task");
  await page.click('button:has-text("Add card")');

  // Verify task created
  await expect(page.locator("text=New Test Task")).toBeVisible();

  // Drag task to different column
  const task = page.locator("text=New Test Task");
  const targetColumn = page.locator('[data-droppable-id="Working"]');
  await task.dragTo(targetColumn);

  // Verify task moved
  await expect(targetColumn.locator("text=New Test Task")).toBeVisible();
});
```

---

#### 4. Backend Tests (Python)

```python
# Example: test_tasks.py
import frappe
from frappe.tests.utils import FrappeTestCase

class TestTasks(FrappeTestCase):
    def setUp(self):
        self.project = frappe.get_doc({
            "doctype": "Project",
            "project_name": "Test Project"
        }).insert()

    def test_add_card(self):
        from sprintspace.api.tasks import add_card

        result = add_card(
            subject="Test Task",
            status="Open",
            project=self.project.name
        )

        self.assertEqual(result["message"], "Task added successfully")

        # Verify task created
        task = frappe.get_last_doc("Task")
        self.assertEqual(task.subject, "Test Task")
        self.assertEqual(task.status, "Open")

    def test_get_tasks(self):
        from sprintspace.api.tasks import get_tasks

        # Create test tasks
        for i in range(5):
            frappe.get_doc({
                "doctype": "Task",
                "subject": f"Task {i}",
                "project": self.project.name,
                "status": "Open"
            }).insert()

        # Get tasks
        result = get_tasks(project=self.project.name)

        self.assertIsInstance(result, list)
        self.assertEqual(len(result), 5)

    def tearDown(self):
        frappe.delete_doc("Project", self.project.name)
```

---

## Implementation Priority

### Phase 1: Critical Fixes (Week 1-2)

**Goal**: Make the app stable and prevent crashes

1. ✅ Add error boundaries throughout the app
2. ✅ Implement proper error handling for all API calls
3. ✅ Add toast notification system
4. ✅ Fix filter implementation to properly trigger refetch
5. ✅ Fix memory leaks (add cleanup in useEffect)
6. ✅ Add loading states and skeletons
7. ✅ Fix type safety issues (remove 'any' types)

**Estimated Time**: 40-60 hours

---

### Phase 2: Performance & UX (Week 3-4)

**Goal**: Make the app fast and responsive

1. ✅ Implement optimistic UI updates
2. ✅ Optimize drag and drop (minimal updates)
3. ✅ Add keyboard shortcuts
4. ✅ Implement proper state management for filters
5. ✅ Add data validation with Zod
6. ✅ Backend API improvements (validation, caching)
7. ✅ Memoize expensive components

**Estimated Time**: 50-70 hours

---

### Phase 3: Enhanced Features (Week 5-6)

**Goal**: Add Trello-like features

1. ✅ Search functionality
2. ✅ Card labels/tags
3. ✅ Card cover images
4. ✅ Undo/redo functionality
5. ✅ Bulk operations
6. ✅ Activity feed improvements
7. ✅ Due date reminders

**Estimated Time**: 60-80 hours

---

### Phase 4: Accessibility & Polish (Week 7-8)

**Goal**: Make the app accessible and professional

1. ✅ Full keyboard navigation
2. ✅ ARIA labels and screen reader support
3. ✅ Focus management
4. ✅ Color contrast fixes
5. ✅ Comprehensive testing (unit, integration, e2e)
6. ✅ Documentation
7. ✅ Performance optimization

**Estimated Time**: 40-60 hours

---

### Phase 5: Advanced Features (Week 9-12)

**Goal**: Professional-grade features

1. ✅ Card templates
2. ✅ Board templates
3. ✅ Custom fields
4. ✅ Time tracking
5. ✅ Dependencies & blockers
6. ✅ Real-time collaboration (if needed)
7. ✅ Mobile optimization

**Estimated Time**: 80-120 hours

---

## Quick Wins (Can Do Immediately)

These are small changes that provide immediate value:

1. ✅ Add key prop to Avatar in TaskCard
2. ✅ Fix hardcoded "Omar" in modal-activity.tsx
3. ✅ Add "Clear filters" button
4. ✅ Add active filter count badge
5. ✅ Persist filters to localStorage
6. ✅ Add better error messages instead of console.error
7. ✅ Add loading spinners to buttons
8. ✅ Add tooltips to icon buttons
9. ✅ Improve empty states (no tasks, no projects)
10. ✅ Add confirmation dialogs for destructive actions

**Estimated Time**: 8-12 hours

---

## Conclusion

SprintSpace has a solid foundation with good architectural choices. The main areas needing attention are:

1. **Stability**: Error handling, edge cases, validation
2. **Performance**: Optimistic updates, caching, minimal re-renders
3. **User Experience**: Keyboard shortcuts, loading states, feedback
4. **Accessibility**: ARIA labels, keyboard navigation, screen readers
5. **Features**: Search, labels, undo/redo to match Trello

By following this enhancement plan in phases, SprintSpace can evolve into a robust, production-ready project management tool that rivals Trello in functionality and user experience.

---

## Next Steps

1. **Review this document** with your team
2. **Prioritize items** based on your specific needs
3. **Set up testing infrastructure** (Vitest + Playwright)
4. **Create GitHub issues** for each enhancement
5. **Start with Quick Wins** to build momentum
6. **Tackle Phase 1 (Critical Fixes)** to stabilize the app
7. **Iterate through remaining phases** based on user feedback

---

**Document Version**: 1.0  
**Last Updated**: December 28, 2025  
**Author**: AI Code Review Assistant
