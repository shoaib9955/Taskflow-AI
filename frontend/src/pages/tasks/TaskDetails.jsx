import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  ArrowLeft,
  CheckSquare,
  CalendarDays,
  User,
  FolderKanban,
  Building2,
  Tag,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Clock3,
  Paperclip,
  ExternalLink,
  Upload,
  FileText,
  Loader2,
  MessageSquare,
  Send,
  MoreHorizontal,
  Edit3,
} from "lucide-react";

import api from "../../services/api";
import { useWorkspace } from "../../context/WorkspaceContext";

const initialFormData = {
  title: "",
  description: "",
  assignedTo: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentWorkspace, loading: workspaceLoading } = useWorkspace();

  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [commentContent, setCommentContent] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingContent, setEditingContent] = useState("");
  const [commentActionLoading, setCommentActionLoading] = useState("");
  const [commentActionError, setCommentActionError] = useState("");
  const [commentDeleteId, setCommentDeleteId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditModal, setShowEditModal] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [saving, setSaving] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [formError, setFormError] = useState("");

  const [deleteError, setDeleteError] = useState("");

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const fileInputRef = useRef(null);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");

      const [taskResponse, projectsResponse] = await Promise.all([
        api.get(`/tasks/${id}`),
        api.get("/projects", {
          params: {
            workspace: currentWorkspace._id,
            page: 1,
            limit: 100,
          },
        }),
      ]);

      const taskData = taskResponse.data.data;
      const taskWorkspaceId = getId(taskData?.workspace);

      if (
        currentWorkspace?._id &&
        taskWorkspaceId &&
        taskWorkspaceId !== currentWorkspace._id
      ) {
        throw new Error("This task does not belong to the selected workspace.");
      }

      setTask(taskData);

      setProjects(
        projectsResponse.data.data?.projects ||
          projectsResponse.data.data ||
          [],
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load task.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || workspaceLoading) {
      return;
    }

    if (!currentWorkspace?._id) {
      setError("No workspace selected.");
      setLoading(false);
      return;
    }

    fetchTask();
  }, [id, currentWorkspace?._id, workspaceLoading]);

  const fetchComments = async () => {
    if (!id) {
      return;
    }

    try {
      setCommentsLoading(true);
      setCommentsError("");

      const response = await api.get(`/comments/task/${id}`);

      setComments(response.data.data || []);
    } catch (error) {
      setCommentsError(
        error.response?.data?.message || "Failed to load comments.",
      );
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchComments();
    }
  }, [id]);

  const handleAddComment = async (event) => {
    event.preventDefault();

    const content = commentContent.trim();

    if (!content) {
      setCommentActionError("Comment cannot be empty.");
      return;
    }

    if (content.length > 2000) {
      setCommentActionError("Comment cannot exceed 2000 characters.");
      return;
    }

    try {
      setCommentSubmitting(true);
      setCommentActionError("");

      const response = await api.post("/comments", {
        task: id,
        content,
      });

      const newComment = response.data.data;

      setComments((previous) => [newComment, ...previous]);
      setCommentContent("");
    } catch (error) {
      setCommentActionError(
        error.response?.data?.message || "Failed to add comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const startEditComment = (comment) => {
    setCommentActionError("");
    setEditingCommentId(comment._id);
    setEditingContent(comment.content || "");
  };

  const cancelEditComment = () => {
    if (commentActionLoading) {
      return;
    }

    setEditingCommentId(null);
    setEditingContent("");
    setCommentActionError("");
  };

  const handleUpdateComment = async (commentId) => {
    const content = editingContent.trim();

    if (!content) {
      setCommentActionError("Comment cannot be empty.");
      return;
    }

    if (content.length > 2000) {
      setCommentActionError("Comment cannot exceed 2000 characters.");
      return;
    }

    try {
      setCommentActionLoading(commentId);
      setCommentActionError("");

      const response = await api.patch(`/comments/${commentId}`, {
        content,
      });

      const updatedComment = response.data.data;

      setComments((previous) =>
        previous.map((comment) =>
          comment._id === commentId ? updatedComment : comment,
        ),
      );

      setEditingCommentId(null);
      setEditingContent("");
    } catch (error) {
      setCommentActionError(
        error.response?.data?.message || "Failed to update comment.",
      );
    } finally {
      setCommentActionLoading("");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setCommentActionLoading(commentId);
      setCommentActionError("");

      await api.delete(`/comments/${commentId}`);

      setComments((previous) =>
        previous.filter((comment) => comment._id !== commentId),
      );

      setCommentDeleteId(null);
    } catch (error) {
      setCommentActionError(
        error.response?.data?.message || "Failed to delete comment.",
      );
    } finally {
      setCommentActionLoading("");
    }
  };

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

  const openEditModal = () => {
    if (!task) {
      return;
    }

    setFormData({
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
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setFormError("");
    setFormData(initialFormData);
  };

  const validateForm = () => {
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

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      setFormError("");

      const response = await api.patch(`/tasks/${id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),

        assignedTo: formData.assignedTo || null,

        status: formData.status,
        priority: formData.priority,

        dueDate: formData.dueDate || null,

        tags,
      });

      setTask(response.data.data);

      closeEditModal();
    } catch (error) {
      setFormError(error.response?.data?.message || "Failed to update task.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!task || task.status === newStatus) {
      return;
    }

    try {
      const response = await api.patch(`/tasks/${id}/status`, {
        status: newStatus,
      });

      setTask(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update task status.",
      );
    }
  };

  const handleAssignmentChange = async (userId) => {
    if (!task) {
      return;
    }

    try {
      const response = await api.patch(`/tasks/${id}/assign`, {
        assignedTo: userId || null,
      });

      setTask(response.data.data);
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update task assignment.",
      );
    }
  };

  const openDeleteModal = () => {
    setDeleteError("");
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteError("");
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setDeleteError("");

      await api.delete(`/tasks/${id}`);

      navigate("/tasks", {
        replace: true,
      });
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete task.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setUploadError("");

    const currentAttachmentCount = Array.isArray(task?.attachments)
      ? task.attachments.length
      : 0;

    const remainingSlots = 5 - currentAttachmentCount;

    if (remainingSlots <= 0) {
      setUploadError("This task already has the maximum of 5 attachments.");
      event.target.value = "";
      return;
    }

    if (files.length > remainingSlots) {
      setUploadError(
        `You can add only ${remainingSlots} more ${
          remainingSlots === 1 ? "file" : "files"
        }. A task can have a maximum of 5 attachments.`,
      );
      event.target.value = "";
      return;
    }

    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    const invalidType = files.find(
      (file) => !allowedMimeTypes.includes(file.type),
    );

    if (invalidType) {
      setUploadError(`"${invalidType.name}" is not a supported file type.`);
      event.target.value = "";
      return;
    }

    const invalidSize = files.find((file) => file.size > 10 * 1024 * 1024);

    if (invalidSize) {
      setUploadError(
        `"${invalidSize.name}" exceeds the maximum file size of 10 MB.`,
      );
      event.target.value = "";
      return;
    }

    setSelectedFiles(files);
    event.target.value = "";
  };

  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((previous) =>
      previous.filter((_, fileIndex) => fileIndex !== index),
    );
    setUploadError("");
  };

  const handleUploadFiles = async () => {
    if (!task || selectedFiles.length === 0) {
      return;
    }

    const currentAttachmentCount = Array.isArray(task.attachments)
      ? task.attachments.length
      : 0;

    if (currentAttachmentCount + selectedFiles.length > 5) {
      setUploadError(
        `A task can have a maximum of 5 attachments. You can add only ${
          5 - currentAttachmentCount
        } more files.`,
      );
      return;
    }

    try {
      setUploading(true);
      setUploadError("");
      setError("");

      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResponse = await api.post("/uploads/multiple", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedFiles = uploadResponse.data.data || [];

      if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
        throw new Error("No files were uploaded.");
      }

      const existingAttachments = Array.isArray(task.attachments)
        ? task.attachments
        : [];

      const response = await api.patch(`/tasks/${id}`, {
        attachments: [...existingAttachments, ...uploadedFiles],
      });

      setTask(response.data.data);
      setSelectedFiles([]);
      setUploadError("");
    } catch (error) {
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload files.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (!task) {
      return;
    }

    try {
      const response = await api.delete(
        `/tasks/${id}/attachments/${attachmentId}`,
      );

      setTask(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete attachment.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-[#68746E]">Loading task...</p>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="w-full">
        <button
          type="button"
          onClick={() => navigate("/tasks")}
          className="mb-6 flex items-center gap-2 text-sm font-medium text-[#68746E] transition hover:text-[#315C4B]"
        >
          <ArrowLeft size={17} />
          Back to My Tasks
        </button>

        <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-5">
          <p className="text-sm text-[#8A2638]">{error}</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const projectId = getId(task.project);

  const project =
    typeof task.project === "object"
      ? task.project
      : projects.find((item) => item._id === projectId);

  const workspace = typeof task.workspace === "object" ? task.workspace : null;

  const assignedUser =
    typeof task.assignedTo === "object" ? task.assignedTo : null;

  const attachments = Array.isArray(task.attachments) ? task.attachments : [];

  const taskWorkspace = workspace || currentWorkspace;
  const taskWorkspaceRole = getWorkspaceMemberRole(taskWorkspace, user);
  const isTaskCreator = getId(task.createdBy) === getId(user);
  const isTaskAssignee = getId(task.assignedTo) === getId(user);
  const canUpdateTask =
    ["owner", "admin", "manager"].includes(taskWorkspaceRole) ||
    isTaskCreator ||
    isTaskAssignee;
  const canAssignTask = ["owner", "admin", "manager"].includes(
    taskWorkspaceRole,
  );
  const canDeleteTask = ["owner", "admin"].includes(taskWorkspaceRole);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => navigate("/tasks")}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-[#68746E] transition hover:text-[#315C4B]"
      >
        <ArrowLeft size={17} />
        Back to My Tasks
      </button>

      {error && (
        <div className="mb-6 flex items-start justify-between gap-4 border border-[#E8C9C7] bg-[#F8ECEB] p-4">
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

      <section className="border border-[#DDE3DF] bg-white">
        <div className="border-b border-[#E7EBE8] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                <CheckSquare size={23} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className={`text-2xl font-semibold sm:text-3xl ${
                      task.status === "completed"
                        ? "text-[#89938E] line-through"
                        : "text-[#18211D]"
                    }`}
                  >
                    {task.title}
                  </h1>

                  <StatusBadge value={task.status} />

                  <PriorityBadge value={task.priority} />
                </div>

                <p className="mt-2 text-sm text-[#68746E]">
                  Task details and progress.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {canUpdateTask && (
                <button
                  type="button"
                  onClick={openEditModal}
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B]"
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}

              {canDeleteTask && (
                <button
                  type="button"
                  onClick={openDeleteModal}
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#E1C7C5] bg-[#FBF3F2] px-4 text-sm font-medium text-[#8A2638] transition hover:bg-[#F8ECEB]"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-[#E7EBE8] sm:grid-cols-4">
          <InfoItem
            icon={<CalendarDays size={17} />}
            label="Due date"
            value={task.dueDate ? formatDate(task.dueDate) : "No due date"}
          />

          <InfoItem
            icon={<User size={17} />}
            label="Assigned to"
            value={assignedUser?.name || "Unassigned"}
          />

          <InfoItem
            icon={<FolderKanban size={17} />}
            label="Project"
            value={project?.name || "No project"}
          />

          <InfoItem
            icon={<Building2 size={17} />}
            label="Workspace"
            value={
              workspace?.name ||
              getWorkspaceNameFromProjects(project, projects) ||
              "Workspace"
            }
          />
        </div>
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Description
              </h2>
            </div>

            <div className="p-5">
              {task.description ? (
                <p className="whitespace-pre-wrap text-sm leading-7 text-[#68746E]">
                  {task.description}
                </p>
              ) : (
                <p className="text-sm text-[#89938E]">
                  No description provided.
                </p>
              )}
            </div>
          </section>

          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Task Status
              </h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Update the current progress.
              </p>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-3">
              <StatusOption
                active={task.status === "todo"}
                icon={<Circle size={18} />}
                label="To Do"
                onClick={() => handleStatusChange("todo")}
                disabled={!canUpdateTask}
              />

              <StatusOption
                active={task.status === "in-progress"}
                icon={<Clock3 size={18} />}
                label="In Progress"
                onClick={() => handleStatusChange("in-progress")}
                disabled={!canUpdateTask}
              />

              <StatusOption
                active={task.status === "completed"}
                icon={<CheckCircle2 size={18} />}
                label="Completed"
                onClick={() => handleStatusChange("completed")}
                disabled={!canUpdateTask}
              />
            </div>
          </section>

          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#18211D]">
                    Attachments
                  </h2>

                  <p className="mt-1 text-sm text-[#68746E]">
                    Add files to this task. Maximum 5 files, 10 MB each.
                  </p>
                </div>

                <Paperclip size={19} className="shrink-0 text-[#315C4B]" />
              </div>
            </div>

            <div className="p-5">
              {uploadError && (
                <div className="mb-4 flex items-start justify-between gap-3 border border-[#E8C9C7] bg-[#F8ECEB] p-3">
                  <p className="text-sm text-[#8A2638]">{uploadError}</p>

                  <button
                    type="button"
                    onClick={() => setUploadError("")}
                    className="shrink-0 text-[#8A2638]"
                    aria-label="Close upload error"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.doc,.docx,.xls,.xlsx"
                onChange={handleFileSelect}
                disabled={!canUpdateTask}
                className="hidden"
              />

              <div className="border border-dashed border-[#BFD8C7] bg-[#F7F8F6] p-5 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                  <Upload size={19} />
                </div>

                <p className="mt-3 text-sm font-medium text-[#18211D]">
                  Add files to this task
                </p>

                <p className="mt-1 text-xs text-[#89938E]">
                  JPG, PNG, WEBP, PDF, TXT, DOC, DOCX, XLS or XLSX
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={
                    !canUpdateTask || uploading || attachments.length >= 5
                  }
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-[#D6DDD8] bg-white px-3.5 text-xs font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Paperclip size={14} />
                  Choose Files
                </button>
              </div>

              {selectedFiles.length > 0 && (
                <div className="mt-4 border border-[#DDE3DF] bg-white">
                  <div className="border-b border-[#E7EBE8] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-[#18211D]">
                          Selected files
                        </p>

                        <p className="mt-0.5 text-xs text-[#89938E]">
                          {selectedFiles.length}{" "}
                          {selectedFiles.length === 1 ? "file" : "files"} ready
                          to upload
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleUploadFiles}
                        disabled={!canUpdateTask || uploading}
                        className="flex h-9 items-center gap-2 rounded-lg bg-[#315C4B] px-3.5 text-xs font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploading ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload size={14} />
                            Upload Files
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="divide-y divide-[#EEF1EF]">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={`${file.name}-${file.size}-${index}`}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                          <FileText size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#18211D]">
                            {file.name}
                          </p>

                          <p className="mt-1 text-xs text-[#89938E]">
                            {formatFileSize(file.size)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSelectedFile(index)}
                          disabled={uploading}
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#F8ECEB] hover:text-[#8A2638] disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Remove ${file.name}`}
                        >
                          <X size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="mt-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm font-medium text-[#18211D]">
                      Attached files
                    </p>

                    <span className="text-xs text-[#89938E]">
                      {attachments.length}/5
                    </span>
                  </div>

                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <AttachmentRow
                        key={
                          attachment._id ||
                          attachment.publicId ||
                          attachment.url
                        }
                        attachment={attachment}
                        onDelete={
                          canUpdateTask
                            ? () => handleDeleteAttachment(attachment._id)
                            : undefined
                        }
                      />
                    ))}
                  </div>
                </div>
              )}

              {attachments.length === 0 && selectedFiles.length === 0 && (
                <div className="py-6 text-center">
                  <Paperclip size={26} className="mx-auto text-[#89938E]" />

                  <p className="mt-3 text-sm text-[#68746E]">
                    No attachments yet.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="border border-[#DDE3DF] bg-white">
          <div className="border-b border-[#E7EBE8] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#18211D]">
                  <MessageSquare size={19} className="text-[#315C4B]" />
                  Comments
                </h2>

                <p className="mt-1 text-sm text-[#68746E]">
                  Discuss this task with your team.
                </p>
              </div>

              <span className="text-xs text-[#89938E]">
                {comments.length}{" "}
                {comments.length === 1 ? "comment" : "comments"}
              </span>
            </div>
          </div>

          <div className="p-5">
            {commentActionError && (
              <div className="mb-4 flex items-start justify-between gap-3 border border-[#E8C9C7] bg-[#F8ECEB] p-3">
                <p className="text-sm text-[#8A2638]">{commentActionError}</p>

                <button
                  type="button"
                  onClick={() => setCommentActionError("")}
                  className="shrink-0 text-[#8A2638]"
                  aria-label="Close comment error"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <form onSubmit={handleAddComment}>
              <div className="flex items-start gap-3">
                <UserAvatar user={user} />

                <div className="min-w-0 flex-1">
                  <textarea
                    value={commentContent}
                    onChange={(event) => {
                      setCommentContent(event.target.value);

                      if (commentActionError) {
                        setCommentActionError("");
                      }
                    }}
                    rows={3}
                    maxLength={2000}
                    placeholder="Write a comment..."
                    disabled={commentSubmitting}
                    className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                  />

                  <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-[#89938E]">
                      {commentContent.length}/2000 characters
                    </p>

                    <button
                      type="submit"
                      disabled={commentSubmitting || !commentContent.trim()}
                      className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-lg bg-[#315C4B] px-4 text-xs font-medium text-white transition hover:bg-[#274D3F] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {commentSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Add Comment
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            <div className="mt-6">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-[#315C4B]" />
                  <span className="ml-2 text-sm text-[#68746E]">
                    Loading comments...
                  </span>
                </div>
              ) : commentsError ? (
                <div className="border border-[#E8C9C7] bg-[#F8ECEB] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-[#8A2638]">{commentsError}</p>

                    <button
                      type="button"
                      onClick={fetchComments}
                      className="text-xs font-medium text-[#8A2638] underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : comments.length === 0 ? (
                <div className="border border-dashed border-[#D6DDD8] bg-[#F7F8F6] py-8 text-center">
                  <MessageSquare size={25} className="mx-auto text-[#89938E]" />

                  <p className="mt-3 text-sm font-medium text-[#18211D]">
                    No comments yet
                  </p>

                  <p className="mt-1 text-xs text-[#89938E]">
                    Be the first to leave a comment.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {comments.map((comment) => {
                    const commentUser =
                      typeof comment.user === "object" ? comment.user : null;

                    const isOwnComment =
                      commentUser?._id &&
                      user?._id &&
                      commentUser._id.toString() === user._id.toString();

                    const isEditing = editingCommentId === comment._id;

                    const isDeleting = commentActionLoading === comment._id;

                    return (
                      <div key={comment._id} className="flex items-start gap-3">
                        <UserAvatar user={commentUser} />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex min-w-0 flex-wrap items-center gap-2">
                              <p className="truncate text-sm font-semibold text-[#18211D]">
                                {commentUser?.name || "User"}
                              </p>

                              <span className="text-xs text-[#89938E]">
                                {formatCommentDate(comment.createdAt)}
                              </span>

                              {comment.editedAt && (
                                <span className="text-xs text-[#89938E]">
                                  (edited)
                                </span>
                              )}
                            </div>

                            {isOwnComment && !isEditing && (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditComment(comment)}
                                  disabled={isDeleting}
                                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#68746E] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:opacity-50"
                                >
                                  <Edit3 size={13} />
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setCommentDeleteId(comment._id)
                                  }
                                  disabled={isDeleting}
                                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-[#8A2638] transition hover:bg-[#FBF3F2] disabled:opacity-50"
                                >
                                  <Trash2 size={13} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>

                          {isEditing ? (
                            <div className="mt-2">
                              <textarea
                                value={editingContent}
                                onChange={(event) => {
                                  setEditingContent(event.target.value);

                                  if (commentActionError) {
                                    setCommentActionError("");
                                  }
                                }}
                                rows={3}
                                maxLength={2000}
                                disabled={isDeleting}
                                className="w-full resize-none rounded-lg border border-[#315C4B] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none ring-2 ring-[#BFD8C7]"
                              />

                              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-[#89938E]">
                                  {editingContent.length}/2000 characters
                                </p>

                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={cancelEditComment}
                                    disabled={isDeleting}
                                    className="h-8 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-3 text-xs font-medium text-[#18211D] transition hover:bg-[#EAF1EC] disabled:opacity-50"
                                  >
                                    Cancel
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleUpdateComment(comment._id)
                                    }
                                    disabled={
                                      isDeleting || !editingContent.trim()
                                    }
                                    className="h-8 rounded-lg bg-[#315C4B] px-3 text-xs font-medium text-white transition hover:bg-[#274D3F] disabled:opacity-50"
                                  >
                                    {isDeleting ? "Saving..." : "Save"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#68746E]">
                              {comment.content}
                            </p>
                          )}

                          {commentDeleteId === comment._id && !isEditing && (
                            <div className="mt-3 border border-[#E8C9C7] bg-[#F8ECEB] p-3">
                              <p className="text-sm text-[#8A2638]">
                                Delete this comment?
                              </p>

                              <div className="mt-3 flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setCommentDeleteId(null)}
                                  disabled={isDeleting}
                                  className="h-8 rounded-lg border border-[#D6DDD8] bg-white px-3 text-xs font-medium text-[#18211D] disabled:opacity-50"
                                >
                                  Cancel
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteComment(comment._id)
                                  }
                                  disabled={isDeleting}
                                  className="h-8 rounded-lg bg-[#8A2638] px-3 text-xs font-medium text-white transition hover:bg-[#742030] disabled:opacity-50"
                                >
                                  {isDeleting ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">
                Assignment
              </h2>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#DCEBDF] text-sm font-semibold text-[#315C4B]">
                  {assignedUser?.avatar ? (
                    <img
                      src={assignedUser.avatar}
                      alt={assignedUser.name || "User"}
                      className="h-full w-full rounded-md object-cover"
                    />
                  ) : (
                    assignedUser?.name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[#18211D]">
                    {assignedUser?.name || "Unassigned"}
                  </p>

                  <p className="truncate text-xs text-[#89938E]">
                    {assignedUser?.email || "No assignee"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">Due Date</h2>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                  <CalendarDays size={18} />
                </div>

                <div>
                  <p className="text-sm font-medium text-[#18211D]">
                    {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                  </p>

                  {task.dueDate && (
                    <p className="mt-1 text-xs text-[#89938E]">
                      {getDueDateStatus(task.dueDate)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">Tags</h2>
            </div>

            <div className="p-5">
              {Array.isArray(task.tags) && task.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="flex items-center gap-1.5 rounded-full bg-[#EAF1EC] px-2.5 py-1 text-xs font-medium text-[#315C4B]"
                    >
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[#89938E]">No tags.</p>
              )}
            </div>
          </section>

          <section className="border border-[#DDE3DF] bg-white">
            <div className="border-b border-[#E7EBE8] p-5">
              <h2 className="text-lg font-semibold text-[#18211D]">Project</h2>
            </div>

            <div className="p-5">
              {projectId ? (
                <button
                  type="button"
                  onClick={() => navigate(`/projects/${projectId}`)}
                  className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition hover:bg-[#F7F8F6]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
                    <FolderKanban size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#18211D]">
                      {project?.name || "Project"}
                    </p>

                    <p className="mt-1 text-xs text-[#89938E]">Open project</p>
                  </div>

                  <ExternalLink size={15} className="shrink-0 text-[#89938E]" />
                </button>
              ) : (
                <p className="text-sm text-[#89938E]">No project assigned.</p>
              )}
            </div>
          </section>
        </aside>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
          <div className="my-8 w-full max-w-lg border border-[#DDE3DF] bg-white">
            <div className="flex items-center justify-between border-b border-[#E1E5E2] px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold text-[#18211D]">
                  Edit Task
                </h2>

                <p className="mt-1 text-xs text-[#68746E]">
                  Update task details.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditModal}
                disabled={saving}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-[#EAF1EC] hover:text-[#315C4B] disabled:opacity-50"
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
                  disabled={saving || !canAssignTask}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                  rows={4}
                  disabled={saving}
                  className="w-full resize-none rounded-lg border border-[#D6DDD8] bg-white px-3 py-2.5 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-[#18211D]">
                  Assigned to
                </label>

                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleChange}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                >
                  <option value="">Unassigned</option>

                  {getProjectMembers(projectId, projects).map((member) => (
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
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                    className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
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
                  className="h-10 w-full rounded-lg border border-[#D6DDD8] bg-white px-3 text-sm text-[#18211D] outline-none placeholder:text-[#9AA49F] focus:border-[#315C4B] focus:ring-2 focus:ring-[#BFD8C7] disabled:bg-[#F7F8F6]"
                />

                <p className="mt-1.5 text-xs text-[#89938E]">
                  Separate tags with commas.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeEditModal}
                  disabled={saving}
                  className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#EAF1EC] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-[#315C4B] px-4 text-sm font-medium text-white transition hover:bg-[#274D3F] disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
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
                  "{task.title}"
                </span>
                ?
              </p>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[#E7EBE8] p-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="h-10 rounded-lg border border-[#D6DDD8] bg-[#F7F8F6] px-4 text-sm font-medium text-[#18211D] transition hover:bg-[#EAF1EC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="h-10 rounded-lg bg-[#8A2638] px-4 text-sm font-medium text-white transition hover:bg-[#742030] disabled:opacity-60"
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

const UserAvatar = ({ user }) => {
  const name = user?.name || "User";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#DCEBDF] text-sm font-semibold text-[#315C4B]">
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={name}
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
};

const getWorkspaceMemberRole = (workspace, user) => {
  if (!workspace || !user || !Array.isArray(workspace.members)) return "member";
  const member = workspace.members.find(
    (item) => getId(item.user) === getId(user),
  );
  return member?.role || "member";
};

const StatusOption = ({ active, icon, label, onClick, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12 items-center gap-3 rounded-lg border px-4 text-sm font-medium transition ${
        active
          ? "border-[#315C4B] bg-[#EAF1EC] text-[#315C4B]"
          : "border-[#D6DDD8] bg-white text-[#68746E] hover:border-[#BFD8C7] hover:bg-[#F7F8F6]"
      } ${disabled ? "cursor-not-allowed opacity-50 hover:border-[#D6DDD8] hover:bg-white" : ""}`}
    >
      {icon}

      <span>{label}</span>
    </button>
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

const AttachmentRow = ({ attachment, onDelete }) => {
  const fileName =
    attachment.name ||
    attachment.originalName ||
    attachment.filename ||
    "Attachment";

  const fileUrl =
    attachment.url || attachment.secure_url || attachment.path || "";

  return (
    <div className="flex items-center gap-3 border border-[#E1E5E2] bg-[#F7F8F6] p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF1EC] text-[#315C4B]">
        <Paperclip size={16} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#18211D]">
          {fileName}
        </p>

        {attachment.size && (
          <p className="mt-1 text-xs text-[#89938E]">
            {formatFileSize(attachment.size)}
          </p>
        )}
      </div>

      {fileUrl && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#68746E] transition hover:bg-white hover:text-[#315C4B]"
          aria-label={`Open ${fileName}`}
        >
          <ExternalLink size={15} />
        </a>
      )}

      {attachment._id && onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#8A2638] transition hover:bg-[#FBF3F2]"
          aria-label={`Delete ${fileName}`}
        >
          <Trash2 size={15} />
        </button>
      )}
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

const getProjectMembers = (projectId, projects) => {
  if (!projectId) {
    return [];
  }

  const project = projects.find((item) => item._id === projectId);

  return project?.members || [];
};

const getWorkspaceNameFromProjects = (project, projects) => {
  if (!project) {
    return "";
  }

  if (typeof project.workspace === "object") {
    return project.workspace?.name || "";
  }

  const projectData = projects.find((item) => item._id === project._id);

  if (projectData && typeof projectData.workspace === "object") {
    return projectData.workspace?.name || "";
  }

  return "";
};

const formatLabel = (value) => {
  if (!value) {
    return "Not set";
  }

  return String(value)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatCommentDate = (date) => {
  if (!date) {
    return "Unknown date";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Unknown date";
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
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

const getDueDateStatus = (date) => {
  const dueDate = new Date(date);

  if (Number.isNaN(dueDate.getTime())) {
    return "";
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return "Overdue";
  }

  if (dueDate.getTime() === today.getTime()) {
    return "Due today";
  }

  return "Upcoming";
};

const formatFileSize = (bytes) => {
  if (!bytes) {
    return "";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default TaskDetails;
