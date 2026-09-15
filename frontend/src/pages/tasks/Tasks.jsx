import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckSquare,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  User,
  FolderKanban,
  Circle,
  CheckCircle2,
  Clock3,
  Tag,
} from "lucide-react";

import api from "../../services/api";

const initialFormData = {
  title: "",
  description: "",
  project: "",
  workspace: "",
  assignedTo: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

const Tasks = () => {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deletingTask, setDeletingTask] = useState(null);

  const [formData, setFormData] = useState(initialFormData);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [tasksResponse, projectsResponse, workspacesResponse] =
        await Promise.all([
          api.get("/tasks", {
            params: {
              page: 1,
              limit: 100,
            },
          }),

          api.get("/projects"),

          api.get("/workspaces"),
        ]);

      const taskData = tasksResponse.data.data;

      setTasks(taskData?.tasks || []);

      setProjects(
        projectsResponse.data.data?.projects ||
          projectsResponse.data.data ||
          [],
      );

      const workspaceData = workspacesResponse.data.data;

      setWorkspaces(workspaceData?.workspaces || workspaceData || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (formError) {
      setFormError("");
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);

    setFormData({
      ...initialFormData,
    });

    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);

    const projectId =
      typeof task.project === "object"
        ? task.project?._id || ""
        : task.project || "";

    const workspaceId =
      typeof task.workspace === "object"
        ? task.workspace?._id || ""
        : task.workspace || "";

    const assignedTo =
      typeof task.assignedTo === "object"
        ? task.assignedTo?._id || ""
        : task.assignedTo || "";

    setFormData({
      title: task.title || "",
      description: task.description || "",
      project: projectId,
      workspace: workspaceId,
      assignedTo,
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: formatDateForInput(task.dueDate),
      tags: Array.isArray(task.tags) ? task.tags.join(", ") : "",
    });

    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (saving) {
      return;
    }

    setShowFormModal(false);
    setEditingTask(null);

    setFormData({
      ...initialFormData,
    });

    setFormError("");
  };

  const validateTask = () => {
    const title = formData.title.trim();

    if (!title) {
      return "Task title is required.";
    }

    if (title.length < 2) {
      return "Task title must be at least 2 characters.";
    }

    if (title.length > 200) {
      return "Task title cannot exceed 200 characters.";
    }

    if (!editingTask && !formData.project) {
      return "Please select a project.";
    }

    if (!editingTask && !formData.workspace) {
      return "Please select a workspace.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateTask();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const title = formData.title.trim();

    const description = formData.description.trim();

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setFormError("");

      if (editingTask) {
        const updateData = {
          title,
          description,
          assignedTo: formData.assignedTo || null,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          tags,
        };

        const response = await api.patch(
          `/tasks/${editingTask._id}`,
          updateData,
        );

        const updatedTask = response.data.data;

        setTasks((previous) =>
          previous.map((task) =>
            task._id === updatedTask._id ? updatedTask : task,
          ),
        );
      } else {
        const createData = {
          title,
          description,
          project: formData.project,
          workspace: formData.workspace,
          assignedTo: formData.assignedTo || null,
          status: formData.status,
          priority: formData.priority,
          dueDate: formData.dueDate || null,
          tags,
        };

        const response = await api.post("/tasks", createData);

        const newTask = response.data.data;

        setTasks((previous) => [newTask, ...previous]);
      }

      closeFormModal();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Failed to ${editingTask ? "update" : "create"} task.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) {
      return;
    }

    try {
      const response = await api.patch(`/tasks/${task._id}/status`, {
        status: newStatus,
      });

      const updatedTask = response.data.data;

      setTasks((previous) =>
        previous.map((item) =>
          item._id === updatedTask._id
            ? {
                ...item,
                ...updatedTask,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update task status.",
      );
    }
  };

  const handleAssignmentChange = async (task, userId) => {
    try {
      const response = await api.patch(`/tasks/${task._id}/assign`, {
        assignedTo: userId || null,
      });

      const updatedTask = response.data.data;

      setTasks((previous) =>
        previous.map((item) =>
          item._id === updatedTask._id
            ? {
                ...item,
                ...updatedTask,
              }
            : item,
        ),
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update task assignment.",
      );
    }
  };

  const openDeleteModal = (task) => {
    setDeletingTask(task);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeletingTask(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deletingTask) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete(`/tasks/${deletingTask._id}`);

      setTasks((previous) =>
        previous.filter((task) => task._id !== deletingTask._id),
      );

      closeDeleteModal();
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredTasks = useMemo(() => {
    const searchValue = search.toLowerCase().trim();

    return tasks.filter((task) => {
      const title = task.title?.toLowerCase() || "";

      const description = task.description?.toLowerCase() || "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        description.includes(searchValue);

      const taskProjectId = getId(task.project);

      const matchesProject = !projectFilter || taskProjectId === projectFilter;

      const matchesStatus = !statusFilter || task.status === statusFilter;

      const matchesPriority =
        !priorityFilter || task.priority === priorityFilter;

      return (
        matchesSearch && matchesProject && matchesStatus && matchesPriority
      );
    });
  }, [tasks, search, statusFilter, priorityFilter, projectFilter]);

  const stats = useMemo(() => {
    return {
      total: tasks.length,

      todo: tasks.filter((task) => task.status === "todo").length,

      inProgress: tasks.filter((task) => task.status === "in-progress").length,

      completed: tasks.filter((task) => task.status === "completed").length,
    };
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="w-full">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#68746E]">Workspace</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">
            My Tasks
          </h1>

          <p className="mt-2 text-sm text-[#68746E]">
            Manage and track your assigned work.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F]"
        >
          <Plus size={17} />
          Create Task
        </button>
      </div>

      {error && (
        <div className="mt-6 flex items-start justify-between gap-4 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <p className="text-sm text-[#8A2638]">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-[#8A2638]"
            aria-label="Close error"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total tasks"
          value={stats.total}
          icon={<CheckSquare size={18} />}
        />

        <StatCard
          label="To do"
          value={stats.todo}
          icon={<Circle size={18} />}
        />

        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={<Clock3 size={18} />}
        />

        <StatCard
          label="Completed"
          value={stats.completed}
          icon={<CheckCircle2 size={18} />}
        />
      </div>

      <div className="mt-6 border border-[#DDE3DF] bg-white p-4">
        <div className="flex flex-col gap-3 xl:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tasks..."
              className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
            />
          </div>

          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
          >
            <option value="">All Projects</option>

            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
          >
            <option value="">All Status</option>

            <option value="todo">To Do</option>

            <option value="in-progress">In Progress</option>

            <option value="completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
          >
            <option value="">All Priority</option>

            <option value="low">Low</option>

            <option value="medium">Medium</option>

            <option value="high">High</option>

            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div className="mt-6 border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] px-5 py-4">
          <h2 className="text-lg font-semibold text-[#18211D]">Tasks</h2>

          <p className="mt-1 text-sm text-[#68746E]">
            {filteredTasks.length}{" "}
            {filteredTasks.length === 1 ? "task" : "tasks"} shown
          </p>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center">
            <CheckSquare size={30} className="mx-auto text-[#315C4B]" />

            <h3 className="mt-4 text-base font-semibold text-[#18211D]">
              No tasks found
            </h3>

            <p className="mt-2 text-sm text-[#68746E]">
              {tasks.length === 0
                ? "Create your first task to get started."
                : "Try changing your search or filters."}
            </p>

            {tasks.length === 0 && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F]"
              >
                <Plus size={17} />
                Create Task
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#E7EBE8]">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                projects={projects}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
                onAssignmentChange={handleAssignmentChange}
                onOpenProject={(projectId) =>
                  navigate(`/projects/${projectId}`)
                }
                onOpenTask={(taskId) => navigate(`/tasks/${taskId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg border border-[#DDE3DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E1E5E2] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#18211D]">
                  {editingTask ? "Edit Task" : "Create Task"}
                </h2>

                <p className="mt-1 text-xs text-[#68746E]">
                  {editingTask ? "Update task details." : "Create a new task."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68746E] hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {formError && (
                <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-3">
                  <p className="text-sm text-[#8A2638]">{formError}</p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Task title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the task"
                  rows={3}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              {!editingTask && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                      Project
                    </label>

                    <select
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      disabled={saving}
                      className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                    >
                      <option value="">Select project</option>

                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                      Workspace
                    </label>

                    <select
                      name="workspace"
                      value={formData.workspace}
                      onChange={handleChange}
                      disabled={saving}
                      className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                    >
                      <option value="">Select workspace</option>

                      {workspaces.map((workspace) => (
                        <option key={workspace._id} value={workspace._id}>
                          {workspace.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {editingTask && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                      Project
                    </label>

                    <div className="flex h-10 items-center rounded-lg border border-[#E1E5E2] bg-[#F7F8F6] px-3 text-sm text-[#68746E]">
                      {getProjectName(editingTask, projects)}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                      Workspace
                    </label>

                    <div className="flex h-10 items-center rounded-lg border border-[#E1E5E2] bg-[#F7F8F6] px-3 text-sm text-[#68746E]">
                      {getWorkspaceName(editingTask, workspaces)}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Assign to
                </label>

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                >
                  <option value="">Unassigned</option>

                  {getProjectMembers(
                    formData.project || getId(editingTask?.project),
                    projects,
                  ).map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name || member.email || "Member"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                  >
                    <option value="todo">To Do</option>

                    <option value="in-progress">In Progress</option>

                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Priority
                  </label>

                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                  >
                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>

                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Due date
                </label>

                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Tags
                </label>

                <input
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="frontend, api, bug"
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                />

                <p className="mt-1.5 text-xs text-[#89938E]">
                  Separate multiple tags with commas.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] hover:bg-[#EAF1EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white hover:bg-[#274D3F] disabled:opacity-60"
                >
                  {saving
                    ? editingTask
                      ? "Saving..."
                      : "Creating..."
                    : editingTask
                      ? "Save Changes"
                      : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E1E5E2] px-5 py-4">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Delete Task
              </h2>

              <p className="mt-1 text-xs text-[#68746E]">
                This action cannot be undone.
              </p>
            </div>

            <div className="p-5">
              {deleteError && (
                <div className="mb-4 border border-[#E8C9C7] bg-[#F8ECEB] p-3">
                  <p className="text-sm text-[#8A2638]">{deleteError}</p>
                </div>
              )}

              <p className="text-sm leading-6 text-[#68746E]">
                Are you sure you want to delete{" "}
                <span className="font-medium text-[#18211D]">
                  "{deletingTask.title}"
                </span>
                ?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] hover:bg-[#EAF1EC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 rounded-lg bg-[#8A2638] px-4 text-sm font-medium text-white hover:bg-[#742030] disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TaskCard = ({
  task,
  projects,
  onEdit,
  onDelete,
  onStatusChange,
  onAssignmentChange,
  onOpenProject,
  onOpenTask,
}) => {
  const projectId = getId(task.project);

  const projectName =
    typeof task.project === "object"
      ? task.project?.name
      : getProjectName(task, projects);

  const assignedUser =
    typeof task.assignedTo === "object" ? task.assignedTo : null;

  const isCompleted = task.status === "completed";

  const handleCardClick = () => {
    onOpenTask(task._id);
  };

  const handleCardKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onOpenTask(task._id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="cursor-pointer p-5 transition hover:bg-[#FAFBFA] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#BFD8C7]"
    >
      <div className="flex items-start gap-3">

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();

            onStatusChange(task, isCompleted ? "todo" : "completed");
          }}
          className="mt-0.5 shrink-0 text-[#315C4B] hover:text-[#274D3F]"
          aria-label={
            isCompleted ? "Mark task incomplete" : "Mark task completed"
          }
        >
          {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

            <div className="min-w-0">
              <h3
                className={`text-sm font-semibold ${
                  isCompleted ? "text-[#89938E] line-through" : "text-[#18211D]"
                }`}
              >
                {task.title}
              </h3>

              {task.description && (
                <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-[#68746E]">
                  {task.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <StatusBadge value={task.status} />

              <PriorityBadge value={task.priority} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#89938E]">
            {projectId && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  onOpenProject(projectId);
                }}
                className="flex items-center gap-1.5 transition hover:text-[#315C4B]"
              >
                <FolderKanban size={14} />

                <span>{projectName || "Project"}</span>
              </button>
            )}

            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} />

              <span>
                {task.dueDate ? formatDate(task.dueDate) : "No due date"}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <User size={14} />

              <span>{assignedUser?.name || "Unassigned"}</span>
            </div>

            {Array.isArray(task.tags) && task.tags.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Tag size={14} />

                <span>{task.tags.join(", ")}</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-[#EEF1EF] pt-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={task.status || "todo"}
                onChange={(event) => {
                  event.stopPropagation();

                  onStatusChange(task, event.target.value);
                }}
                onClick={(event) => event.stopPropagation()}
                className="h-9 w-full rounded-lg border border-[#D6DDD8] bg-white px-2.5 text-xs font-medium text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] sm:w-auto"
              >
                <option value="todo">To Do</option>

                <option value="in-progress">In Progress</option>

                <option value="completed">Completed</option>
              </select>

              <select
                value={assignedUser?._id || ""}
                onChange={(event) => {
                  event.stopPropagation();

                  onAssignmentChange(task, event.target.value);
                }}
                onClick={(event) => event.stopPropagation()}
                className="h-9 w-full rounded-lg border border-[#D6DDD8] bg-white px-2.5 text-xs text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] sm:w-auto"
              >
                <option value="">Unassigned</option>

                {getProjectMembers(projectId, projects).map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name || member.email || "Member"}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  onEdit(task);
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-3 text-xs font-medium text-[#18211D] hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
              >
                <Pencil size={14} />
                Edit
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  onDelete(task);
                }}
                className="flex h-9 items-center gap-2 rounded-lg border border-[#E1C7C5] bg-[#FBF3F2] px-3 text-xs font-medium text-[#8A2638] hover:bg-[#F8ECEB]"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon }) => {
  return (
    <div className="border border-[#DDE3DF] bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#89938E]">{label}</span>

        <span className="text-[#315C4B]">{icon}</span>
      </div>

      <p className="mt-3 text-2xl font-semibold text-[#18211D]">{value}</p>
    </div>
  );
};

const StatusBadge = ({ value }) => {
  const styles = {
    todo: "bg-[#F4F6F2] text-[#68746E]",

    "in-progress": "bg-[#EAF1EC] text-[#315C4B]",

    completed: "bg-[#E4F0E7] text-[#315C4B]",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[value] || "bg-[#F4F6F2] text-[#68746E]"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
};

const PriorityBadge = ({ value }) => {
  const styles = {
    low: "bg-[#F4F6F2] text-[#68746E]",

    medium: "bg-[#EAF1EC] text-[#315C4B]",

    high: "bg-[#F5F0E8] text-[#79633F]",

    urgent: "bg-[#FBF3F2] text-[#8A2638]",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[value] || "bg-[#F4F6F2] text-[#68746E]"
      }`}
    >
      {formatLabel(value)}
    </span>
  );
};

const getId = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && value._id) {
    return value._id;
  }

  return value;
};

const getProjectName = (task, projects) => {
  if (!task.project) {
    return "Project";
  }

  if (typeof task.project === "object") {
    return task.project.name || "Project";
  }

  const project = projects.find((item) => item._id === task.project);

  return project?.name || "Project";
};

const getWorkspaceName = (task, workspaces) => {
  if (!task.workspace) {
    return "Workspace";
  }

  if (typeof task.workspace === "object") {
    return task.workspace.name || "Workspace";
  }

  const workspace = workspaces.find((item) => item._id === task.workspace);

  return workspace?.name || "Workspace";
};

const getProjectMembers = (projectId, projects) => {
  if (!projectId) {
    return [];
  }

  const project = projects.find((item) => item._id === projectId);

  return project?.members || [];
};

const formatLabel = (value) => {
  if (!value) {
    return "Not set";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (date) => {
  if (!date) {
    return "Not set";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not set";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
};

export default Tasks;
