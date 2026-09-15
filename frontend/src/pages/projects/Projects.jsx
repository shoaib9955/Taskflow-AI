import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderKanban, Plus, X, Search, Pencil, Trash2 } from "lucide-react";

import api from "../../services/api";
import { useWorkspace } from "../../context/WorkspaceContext";

const initialFormData = {
  name: "",
  description: "",
  workspace: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  dueDate: "",
};

const Projects = () => {
  const navigate = useNavigate();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  const [projects, setProjects] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProject, setDeletingProject] = useState(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [formData, setFormData] = useState(initialFormData);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, workspacesResponse] = await Promise.all([
        api.get("/projects", {
          params: {
            workspace: currentWorkspace?._id,
            page: 1,
            limit: 100,
          },
        }),
        api.get("/workspaces"),
      ]);

      setProjects(projectsResponse.data.data.projects || []);

      const workspaceData = workspacesResponse.data.data;

      setWorkspaces(workspaceData.workspaces || workspaceData || []);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!workspaceLoading) {
      fetchData();
    }
  }, [workspaceLoading, currentWorkspace?._id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateModal = () => {
    if (!currentWorkspace?._id) {
      setError("Please select a workspace first.");
      return;
    }

    setEditingProject(null);
    setFormData({
      ...initialFormData,
      workspace: currentWorkspace._id,
    });
    setFormError("");
    setShowFormModal(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description: project.description || "",

      workspace:
        typeof project.workspace === "object"
          ? project.workspace?._id || ""
          : project.workspace || "",

      status: project.status || "planning",
      priority: project.priority || "medium",

      startDate: formatDateForInput(project.startDate),

      dueDate: formatDateForInput(project.dueDate),
    });

    setFormError("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    if (saving) {
      return;
    }

    setShowFormModal(false);
    setEditingProject(null);

    setFormData({
      ...initialFormData,
    });

    setFormError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setFormError("Project name is required.");
      return;
    }

    if (name.length < 2) {
      setFormError("Project name must be at least 2 characters.");
      return;
    }

    if (name.length > 100) {
      setFormError("Project name cannot exceed 100 characters.");
      return;
    }

    if (!editingProject && !currentWorkspace?._id) {
      setFormError("Please select a workspace first.");
      return;
    }

    if (
      formData.startDate &&
      formData.dueDate &&
      formData.startDate > formData.dueDate
    ) {
      setFormError("Due date cannot be before the start date.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      if (editingProject) {
        const updateData = {
          name,
          description,
          status: formData.status,
          priority: formData.priority,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
        };

        const response = await api.patch(
          `/projects/${editingProject._id}`,
          updateData,
        );

        const updatedProject = response.data.data;

        setProjects((previous) =>
          previous.map((project) =>
            project._id === updatedProject._id ? updatedProject : project,
          ),
        );
      } else {
        const createData = {
          name,
          description,
          workspace: currentWorkspace._id,
          status: formData.status,
          priority: formData.priority,
          startDate: formData.startDate || null,
          dueDate: formData.dueDate || null,
        };

        const response = await api.post("/projects", createData);

        const newProject = response.data.data;

        setProjects((previous) => [newProject, ...previous]);
      }

      closeFormModal();
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Failed to ${editingProject ? "update" : "create"} project.`,
      );
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (project) => {
    setDeletingProject(project);
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeletingProject(null);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!deletingProject) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete(`/projects/${deletingProject._id}`);

      setProjects((previous) =>
        previous.filter((project) => project._id !== deletingProject._id),
      );

      closeDeleteModal();
    } catch (error) {
      setDeleteError(
        error.response?.data?.message || "Failed to delete project.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const openProjectDetails = (project) => {
    navigate(`/projects/${project._id}`);
  };

  const currentWorkspaceId = currentWorkspace?._id || "";

  const workspaceProjects = projects.filter((project) => {
    const projectWorkspaceId =
      typeof project.workspace === "object"
        ? project.workspace?._id
        : project.workspace;

    return projectWorkspaceId === currentWorkspaceId;
  });

  const filteredProjects = workspaceProjects.filter((project) => {
    const projectName = project.name?.toLowerCase() || "";

    const searchValue = search.toLowerCase().trim();

    const matchesSearch = projectName.includes(searchValue);

    const matchesStatus = !status || project.status === status;

    const matchesPriority = !priority || project.priority === priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  if (workspaceLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading workspace...</p>
      </div>
    );
  }

  if (!currentWorkspace) {
    return (
      <div className="w-full">
        <div className="border border-[#DDE3DF] bg-white p-10 text-center">
          <FolderKanban size={28} className="mx-auto text-[#315C4B]" />
          <h2 className="mt-4 text-lg font-semibold text-[#18211D]">
            No workspace selected
          </h2>
          <p className="mt-2 text-sm text-[#68746E]">
            Create or select a workspace to manage projects.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-[#68746E]">{currentWorkspace.name}</p>

          <h1 className="mt-1 text-3xl font-semibold text-[#18211D]">
            Projects
          </h1>

          <p className="mt-2 text-sm text-[#68746E]">
            Manage your team projects.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F]"
        >
          <Plus size={17} />
          Create Project
        </button>
      </div>

      {error && (
        <div className="mt-6 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
          <p className="text-sm text-[#8A2638]">{error}</p>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#89938E]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects..."
            className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white pl-10 pr-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
          />
        </div>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
        >
          <option value="">All Status</option>

          <option value="planning">Planning</option>

          <option value="active">Active</option>

          <option value="completed">Completed</option>

          <option value="on-hold">On Hold</option>

          <option value="archived">Archived</option>
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          className="h-10 rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7]"
        >
          <option value="">All Priority</option>

          <option value="low">Low</option>

          <option value="medium">Medium</option>

          <option value="high">High</option>

          <option value="urgent">Urgent</option>
        </select>
      </div>

      <div className="mt-6">
        {filteredProjects.length === 0 ? (
          <div className="border border-[#DDE3DF] bg-white p-10 text-center">
            <FolderKanban size={28} className="mx-auto text-[#315C4B]" />

            <h2 className="mt-4 text-lg font-semibold text-[#18211D]">
              No projects found
            </h2>

            <p className="mt-2 text-sm text-[#68746E]">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                role="button"
                tabIndex={0}
                onClick={() => openProjectDetails(project)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();

                    openProjectDetails(project);
                  }
                }}
                className="cursor-pointer border border-[#DDE3DF] bg-white p-5 transition hover:border-[#BFD8C7] hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#BFD8C7]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                      <FolderKanban size={19} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-[#18211D]">
                        {project.name}
                      </h2>

                      <p className="mt-1 text-xs text-[#89938E]">
                        {project.members?.length || 0} members
                      </p>
                    </div>
                  </div>

                  <span className="shrink-0 rounded-full bg-[#EAF1EC] px-2.5 py-1 text-xs font-medium text-[#315C4B]">
                    {formatLabel(project.status)}
                  </span>
                </div>

                <p className="mt-5 line-clamp-2 text-sm leading-6 text-[#68746E]">
                  {project.description || "No description provided."}
                </p>

                <div className="mt-5 border-t border-[#E7EBE8] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#89938E]">Priority</p>

                      <p className="mt-1 text-xs font-medium text-[#18211D]">
                        {formatLabel(project.priority)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          openEditModal(project);
                        }}
                        className="flex h-9 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-3 text-xs font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
                      >
                        <Pencil size={14} />

                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();

                          openDeleteModal(project);
                        }}
                        className="flex h-9 items-center justify-center rounded-lg border border-[#E1C7C5] bg-[#FBF3F2] px-3 text-[#8A2638] transition hover:bg-[#F8ECEB]"
                        aria-label={`Delete ${project.name}`}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
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
                  {editingProject ? "Edit Project" : "Create Project"}
                </h2>

                <p className="mt-1 text-xs text-[#68746E]">
                  {editingProject
                    ? "Update project details."
                    : "Create a new project."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close modal"
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
                  Project name
                </label>

                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
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
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows={3}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none transition placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />
              </div>

              {!editingProject && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Workspace
                  </label>

                  <div className="flex h-10 items-center rounded-lg border border-[#E1E5E2] bg-[#F7F8F6] px-3 text-sm text-[#68746E]">
                    {currentWorkspace.name}
                  </div>

                  <p className="mt-1.5 text-xs text-[#89938E]">
                    This project will be created in the currently selected
                    workspace.
                  </p>
                </div>
              )}

              {editingProject && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Workspace
                  </label>

                  <div className="flex h-10 items-center rounded-lg border border-[#E1E5E2] bg-[#F7F8F6] px-3 text-sm text-[#68746E]">
                    {getWorkspaceName(editingProject, workspaces)}
                  </div>

                  <p className="mt-1.5 text-xs text-[#89938E]">
                    Workspace cannot be changed while editing.
                  </p>
                </div>
              )}

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
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  >
                    <option value="planning">Planning</option>

                    <option value="active">Active</option>

                    <option value="completed">Completed</option>

                    <option value="on-hold">On Hold</option>

                    <option value="archived">Archived</option>
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
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  >
                    <option value="low">Low</option>

                    <option value="medium">Medium</option>

                    <option value="high">High</option>

                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                    Start date
                  </label>

                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={saving}
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  />
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
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none transition focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
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
                    ? editingProject
                      ? "Saving..."
                      : "Creating..."
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E1E5E2] px-5 py-4">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Delete Project
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
                  "{deletingProject.name}"
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
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 rounded-lg bg-[#8A2638] px-4 text-sm font-medium text-white transition hover:bg-[#742030] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Project"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatLabel = (value) => {
  if (!value) {
    return "Not set";
  }

  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
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

const getWorkspaceName = (project, workspaces) => {
  if (!project.workspace) {
    return "Workspace";
  }

  if (typeof project.workspace === "object") {
    return project.workspace.name || "Workspace";
  }

  const workspace = workspaces.find((item) => item._id === project.workspace);

  return workspace?.name || "Workspace";
};

export default Projects;
