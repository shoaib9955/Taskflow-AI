import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Users,
  CheckCircle2,
  Circle,
  Clock3,
  AlertCircle,
  Tag,
} from "lucide-react";

import api from "../../services/api";

const initialTaskForm = {
  title: "",
  description: "",
  assignedTo: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTask, setDeletingTask] = useState(null);

  const [taskForm, setTaskForm] = useState(initialTaskForm);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectResponse, tasksResponse] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get("/tasks", {
          params: {
            project: id,
            page: 1,
            limit: 100,
          },
        }),
      ]);

      const projectData = projectResponse.data.data;

      const taskData = tasksResponse.data.data;

      setProject(projectData);
      setTasks(taskData?.tasks || []);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to load project details.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const handleTaskChange = (event) => {
    const { name, value } = event.target;

    setTaskForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateTaskModal = () => {
    setEditingTask(null);

    setTaskForm({
      ...initialTaskForm,
    });

    setFormError("");
    setShowTaskModal(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assignedTo:
        typeof task.assignedTo === "object"
          ? task.assignedTo?._id || ""
          : task.assignedTo || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: formatDateForInput(task.dueDate),
      tags: Array.isArray(task.tags) ? task.tags.join(", ") : "",
    });

    setFormError("");
    setShowTaskModal(true);
  };

  const closeTaskModal = () => {
    if (saving) return;

    setShowTaskModal(false);
    setEditingTask(null);
    setTaskForm(initialTaskForm);
    setFormError("");
  };

  const validateTaskForm = () => {
    const title = taskForm.title.trim();

    if (!title) {
      return "Task title is required.";
    }

    if (title.length < 2) {
      return "Task title must be at least 2 characters.";
    }

    if (title.length > 200) {
      return "Task title cannot exceed 200 characters.";
    }

    if (
      taskForm.dueDate &&
      project?.dueDate &&
      taskForm.dueDate > formatDateForInput(project.dueDate)
    ) {
      return "Task due date cannot be after the project due date.";
    }

    return "";
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateTaskForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const title = taskForm.title.trim();
    const description = taskForm.description.trim();

    const tags = taskForm.tags
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
          assignedTo: taskForm.assignedTo || null,
          status: taskForm.status,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
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
          project: id,
          workspace: getId(project?.workspace),
          assignedTo: taskForm.assignedTo || null,
          status: taskForm.status,
          priority: taskForm.priority,
          dueDate: taskForm.dueDate || null,
          tags,
        };

        const response = await api.post("/tasks", createData);

        const newTask = response.data.data;

        setTasks((previous) => [newTask, ...previous]);

        await refreshTasks();
      }

      closeTaskModal();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Failed to ${editingTask ? "update" : "create"} task.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const refreshTasks = async () => {
    try {
      const response = await api.get("/tasks", {
        params: {
          project: id,
          page: 1,
          limit: 100,
        },
      });

      setTasks(response.data.data?.tasks || []);
    } catch (error) {
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) {
      return;
    }

    try {
      const response = await api.patch(`/tasks/${task._id}`, {
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

  const openDeleteModal = (task) => {
    setDeletingTask(task);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) return;

    setShowDeleteModal(false);
    setDeletingTask(null);
    setDeleteError("");
  };

  const handleDeleteTask = async () => {
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

      const matchesStatus = !statusFilter || task.status === statusFilter;

      const matchesPriority =
        !priorityFilter || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const taskStats = useMemo(() => {
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
        <p className="text-sm text-[#68746E]">Loading project...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate("/projects")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#315C4B] transition hover:text-[#274D3F]"
        >
          <ArrowLeft size={17} />
          Back to Projects
        </button>

        <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-5">
          <p className="text-sm text-[#8A2638]">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const members = project.members || [];

  return (
    <div className="w-full">

      <button
        type="button"
        onClick={() => navigate("/projects")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[#68746E] transition hover:text-[#315C4B]"
      >
        <ArrowLeft size={17} />
        Back to Projects
      </button>

      {error && (
        <div className="mb-6 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <p className="text-sm text-[#8A2638]">{error}</p>
        </div>
      )}

      <section className="border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                <FolderKanban size={23} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold text-[#18211D] sm:text-3xl">
                    {project.name}
                  </h1>

                  <StatusBadge value={project.status} />
                </div>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#68746E]">
                  {project.description || "No description provided."}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-[#F4F6F2] px-3 py-1.5 text-xs font-medium text-[#315C4B]">
                {formatLabel(project.priority)} priority
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#E7EBE8] sm:grid-cols-4">
          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Start date"
            value={formatDate(project.startDate)}
          />

          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Due date"
            value={formatDate(project.dueDate)}
          />

          <InfoItem
            icon={<Users size={17} />}
            label="Members"
            value={`${members.length}`}
          />

          <InfoItem
            icon={<CheckCircle2 size={17} />}
            label="Tasks"
            value={`${taskStats.total}`}
          />
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatBox
          label="Total tasks"
          value={taskStats.total}
          icon={<CheckCircle2 size={18} />}
        />

        <StatBox
          label="To do"
          value={taskStats.todo}
          icon={<Circle size={18} />}
        />

        <StatBox
          label="In progress"
          value={taskStats.inProgress}
          icon={<Clock3 size={18} />}
        />

        <StatBox
          label="Completed"
          value={taskStats.completed}
          icon={<CheckCircle2 size={18} />}
        />
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

        <section className="min-w-0">
          <div className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#18211D]">
                    Project Tasks
                  </h2>

                  <p className="mt-1 text-sm text-[#68746E]">
                    Manage the work for this project.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={openCreateTaskModal}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F]"
                >
                  <Plus size={17} />
                  Create Task
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 lg:flex-row">
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
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                >
                  <option value="">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>

                <select
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
                >
                  <option value="">All Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              {filteredTasks.length === 0 ? (
                <div className="p-10 text-center">
                  <CheckCircle2 size={30} className="mx-auto text-[#315C4B]" />

                  <h3 className="mt-4 text-base font-semibold text-[#18211D]">
                    No tasks found
                  </h3>

                  <p className="mt-2 text-sm text-[#68746E]">
                    {tasks.length === 0
                      ? "Create the first task for this project."
                      : "Try changing your search or filters."}
                  </p>

                  {tasks.length === 0 && (
                    <button
                      type="button"
                      onClick={openCreateTaskModal}
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
                    <TaskRow
                      key={task._id}
                      task={task}
                      onEdit={openEditTaskModal}
                      onDelete={openDeleteModal}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside>
          <div className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-[#18211D]">
                    Members
                  </h2>

                  <p className="mt-1 text-sm text-[#68746E]">
                    {members.length} project{" "}
                    {members.length === 1 ? "member" : "members"}
                  </p>
                </div>

                <Users size={19} className="text-[#315C4B]" />
              </div>
            </div>

            <div className="p-4">
              {members.length === 0 ? (
                <div className="py-6 text-center">
                  <Users size={25} className="mx-auto text-[#89938E]" />

                  <p className="mt-3 text-sm text-[#68746E]">
                    No project members.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {members.map((member) => (
                    <MemberRow key={member._id} member={member} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Project Details
              </h2>
            </div>

            <div className="divide-y divide-[#E7EBE8]">
              <DetailRow label="Status" value={formatLabel(project.status)} />

              <DetailRow
                label="Priority"
                value={formatLabel(project.priority)}
              />

              <DetailRow
                label="Workspace"
                value={
                  typeof project.workspace === "object"
                    ? project.workspace?.name || "Workspace"
                    : "Workspace"
                }
              />

              <DetailRow
                label="Created"
                value={formatDate(project.createdAt)}
              />
            </div>
          </div>
        </aside>
      </div>

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg border border-[#DDE3DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E1E5E2] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#18211D]">
                  {editingTask ? "Edit Task" : "Create Task"}
                </h2>

                <p className="mt-1 text-xs text-[#68746E]">
                  {editingTask
                    ? "Update task details."
                    : "Add a new task to this project."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeTaskModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close task modal"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 p-5">
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
                  value={taskForm.title}
                  onChange={handleTaskChange}
                  placeholder="Enter task title"
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={taskForm.description}
                  onChange={handleTaskChange}
                  placeholder="Describe the task"
                  rows={3}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Assign to
                </label>

                <select
                  name="assignedTo"
                  value={taskForm.assignedTo}
                  onChange={handleTaskChange}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                >
                  <option value="">Unassigned</option>

                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name || "Member"}{" "}
                      {member.email ? `(${member.email})` : ""}
                    </option>
                  ))}
                </select>

                <p className="mt-1.5 text-xs text-[#89938E]">
                  Only project members can be assigned to this task.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Status
                  </label>

                  <select
                    name="status"
                    value={taskForm.status}
                    onChange={handleTaskChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                    value={taskForm.priority}
                    onChange={handleTaskChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                  value={taskForm.dueDate}
                  onChange={handleTaskChange}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />

                {project.dueDate && (
                  <p className="mt-1.5 text-xs text-[#89938E]">
                    Project due date: {formatDate(project.dueDate)}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Tags
                </label>

                <div className="relative">
                  <Tag
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
                  />

                  <input
                    name="tags"
                    value={taskForm.tags}
                    onChange={handleTaskChange}
                    placeholder="backend, api, authentication"
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white pl-9 pr-3 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  />
                </div>

                <p className="mt-1.5 text-xs text-[#89938E]">
                  Separate multiple tags with commas.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  disabled={saving}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#EAF1EC] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
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
                className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#EAF1EC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={deleting}
                className="h-10 rounded-lg bg-[#8A2638] px-4 text-sm font-medium text-white transition hover:bg-[#742030] disabled:cursor-not-allowed disabled:opacity-60"
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

const TaskRow = ({ task, onEdit, onDelete, onStatusChange }) => {
  const isCompleted = task.status === "completed";

  const assignedUser =
    typeof task.assignedTo === "object" ? task.assignedTo : null;

  return (
    <div className="p-5 transition hover:bg-[#FAFBFA]">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() =>
              onStatusChange(task, isCompleted ? "todo" : "completed")
            }
            className="mt-0.5 shrink-0 text-[#315C4B] transition hover:text-[#274D3F]"
            aria-label={
              isCompleted ? "Mark task as incomplete" : "Mark task as completed"
            }
          >
            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3
                  className={`text-sm font-semibold ${
                    isCompleted
                      ? "text-[#89938E] line-through"
                      : "text-[#18211D]"
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

              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge value={task.status} />

                <PriorityBadge value={task.priority} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#89938E]">
              <div className="flex items-center gap-1.5">
                <CalendarDays size={14} />

                <span>
                  {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Users size={14} />

                <span>{assignedUser?.name || "Unassigned"}</span>
              </div>

              {Array.isArray(task.tags) && task.tags.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag size={14} />

                  <span>{task.tags.join(", ")}</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-[#EEF1EF] pt-3 sm:flex-row sm:items-center sm:justify-between">
              <select
                value={task.status || "todo"}
                onChange={(event) => onStatusChange(task, event.target.value)}
                className="h-9 w-full rounded-lg border border-[#D6DDD8] bg-white px-2.5 text-xs font-medium text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] sm:w-auto"
              >
                <option value="todo">To Do</option>

                <option value="in-progress">In Progress</option>

                <option value="completed">Completed</option>
              </select>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(task)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-3 text-xs font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
                >
                  <Pencil size={14} />
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(task)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-[#E1C7C5] bg-[#FBF3F2] px-3 text-xs font-medium text-[#8A2638] transition hover:bg-[#F8ECEB]"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MemberRow = ({ member }) => {
  const initial = member.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="flex items-center gap-3 rounded-lg px-2 py-2.5 transition hover:bg-[#F7F8F6]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#DCEBDF] text-xs font-semibold text-[#315C4B]">
        {member.avatar ? (
          <img
            src={member.avatar}
            alt={member.name || "Member"}
            className="h-full w-full rounded-md object-cover"
          />
        ) : (
          initial
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#18211D]">
          {member.name || "Member"}
        </p>

        <p className="truncate text-xs text-[#89938E]">
          {member.email || "No email"}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ value }) => {
  const styles = {
    planning: "bg-[#F4F6F2] text-[#68746E]",
    active: "bg-[#EAF1EC] text-[#315C4B]",
    "on-hold": "bg-[#F4F1EA] text-[#7A6848]",
    completed: "bg-[#E4F0E7] text-[#315C4B]",
    archived: "bg-[#EEF0EF] text-[#68746E]",
    todo: "bg-[#F4F6F2] text-[#68746E]",
    "in-progress": "bg-[#EAF1EC] text-[#315C4B]",
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

const InfoItem = ({ icon, label, value }) => {
  return (
    <div className="min-w-0 p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[#89938E]">
        {icon}

        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-2 truncate text-sm font-medium text-[#18211D]">
        {value || "Not set"}
      </p>
    </div>
  );
};

const StatBox = ({ label, value, icon }) => {
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

const DetailRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <span className="text-xs text-[#89938E]">{label}</span>

      <span className="truncate text-right text-xs font-medium text-[#18211D]">
        {value || "Not set"}
      </span>
    </div>
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

export default ProjectDetail;
