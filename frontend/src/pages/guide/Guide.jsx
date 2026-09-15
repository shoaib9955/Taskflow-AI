import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  FileText,
  FolderKanban,
  HelpCircle,
  MessageSquare,
  Paperclip,
  Settings,
  Sparkles,
  Users,
  Bell,
  Activity,
  ListChecks,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const Guide = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: "signup",
      icon: <UserRound size={19} />,
      title: "Sign Up",
      description:
        "Create your TaskFlow account and start your workspace journey.",
      steps: [
        "Open the Sign Up page.",
        "Enter your full name, email address, and password.",
        "Use a valid email address and a password with at least 8 characters.",
        "Click Create account.",
        "After successful registration, TaskFlow signs you in and opens the Dashboard.",
        "Use the Guide button on the signup page if you want to learn about TaskFlow before continuing.",
      ],
      tip: "Use an email address you can access because it will be associated with your TaskFlow account.",
    },
    {
      id: "login",
      icon: <UserRound size={19} />,
      title: "Login",
      description: "Sign in to your TaskFlow account and continue your work.",
      steps: [
        "Open the Login page.",
        "Enter the email address associated with your TaskFlow account.",
        "Enter your password.",
        "Click Sign in.",
        "After successful login, TaskFlow opens the Dashboard.",
        "Use the Guide button if you want to review how TaskFlow works.",
      ],
      tip: "If you are new to TaskFlow, create an account from the Sign Up page first.",
    },
    {
      id: "dashboard",
      icon: <ClipboardList size={19} />,
      title: "Dashboard",
      description: "Get a quick overview of your work and team activity.",
      steps: [
        "Open Dashboard from the sidebar.",
        "The Dashboard shows data for your currently selected workspace.",
        "Review your task statistics and overall progress for that workspace.",
        "Check recent tasks and projects belonging to the selected workspace.",
        "Switch workspaces from the sidebar to view another workspace's data.",
        "Select a task or project to open its details.",
      ],
    },
    {
      id: "projects",
      icon: <FolderKanban size={19} />,
      title: "Projects",
      description: "Create and manage the projects your team is working on.",
      steps: [
        "Open Projects from the sidebar.",
        "Projects shown belong to your currently selected workspace.",
        "Click New Project and enter the project name and details if you have permission.",
        "Save the project.",
        "Open a project to view its details, members, and tasks.",
        "Use Edit or Delete when your workspace role allows that action.",
        "Switch workspaces from the sidebar to work with another workspace's projects.",
      ],
    },
    {
      id: "project-details",
      icon: <ListChecks size={19} />,
      title: "Project Details",
      description: "Manage the work inside a specific project from one place.",
      steps: [
        "Open a project from the Projects page.",
        "Confirm the project belongs to your currently selected workspace.",
        "Review project information, status, priority, dates, and members.",
        "Use the task section to create and manage project tasks when you have permission.",
        "Search or filter tasks when the project has many tasks.",
        "Open any task to view its complete details.",
      ],
    },
    {
      id: "tasks",
      icon: <CheckCircle2 size={19} />,
      title: "Tasks",
      description: "Create, organize, assign, and track your team's work.",
      steps: [
        "Open My Tasks from the sidebar.",
        "Tasks shown belong to your currently selected workspace.",
        "Click New Task if your workspace role allows task creation.",
        "Choose a project and enter the task title and description.",
        "Set priority, status, due date, tags, and assignee.",
        "Save the task.",
        "Use search and filters to quickly find tasks.",
        "Switch workspaces from the sidebar to view tasks from another workspace you belong to.",
      ],
      tip: "Keep task titles short and specific so your team can understand the work quickly.",
    },
    {
      id: "task-details",
      icon: <FileText size={19} />,
      title: "Task Details",
      description: "Use the task detail page to manage one task completely.",
      steps: [
        "Open a task from My Tasks or a Project in your current workspace.",
        "Review its project, workspace, assignee, priority, due date, and tags.",
        "Workspace owners, admins, and managers can update tasks; task creators and assignees can also update their tasks.",
        "Change the status as work progresses when you have update permission.",
        "Workspace owners, admins, and managers can assign tasks to workspace/project members.",
        "Workspace owners and admins can delete tasks.",
      ],
    },
    {
      id: "attachments",
      icon: <Paperclip size={19} />,
      title: "Task Attachments",
      description: "Keep useful files directly with the task they belong to.",
      steps: [
        "Open the task detail page.",
        "Go to the Attachments section.",
        "Choose the files you want to attach.",
        "Upload them to the task.",
        "Open an attachment when you need to view it.",
        "Delete an attachment when it is no longer needed.",
      ],
      tip: "A task can contain up to 5 attachments, with a maximum size of 10 MB per file.",
    },
    {
      id: "workspace",
      icon: <BriefcaseBusiness size={19} />,
      title: "Workspaces & Roles",
      description:
        "Keep team data separated while giving each member the right level of access.",
      steps: [
        "Use the workspace selector in the sidebar to choose the workspace you want to work in.",
        "Only workspaces you belong to are available to you.",
        "Your role is assigned separately inside each workspace, so the same user can have different roles in different workspaces.",
        "Workspace roles are Owner, Admin, Manager, and Member.",
        "The workspace owner has the highest workspace-level management permissions.",
        "Admins can perform most workspace management actions, while managers have broader work-management permissions.",
        "Members have access to workspace data but cannot perform restricted management actions.",
        "Projects, tasks, activity, and other workspace-scoped data must stay within the selected workspace.",
        "Creating a new workspace makes you its owner.",
      ],
      tip: "Changing the selected workspace changes the workspace context used by the application. It does not give you access to workspaces you do not belong to.",
    },
    {
      id: "team",
      icon: <Users size={19} />,
      title: "Team & Workspace",
      description: "Manage workspace members and their roles.",
      steps: [
        "Open Team from the sidebar.",
        "Select the workspace you want to manage.",
        "Review workspace members and their roles.",
        "Owners and admins can add members.",
        "Owners and admins can change member roles, subject to role restrictions.",
        "Owners and admins can remove members when necessary, subject to role restrictions.",
      ],
      tip: "Workspace permissions control which team members can perform management actions. A user's role is specific to each workspace.",
    },
    {
      id: "activity",
      icon: <Activity size={19} />,
      title: "Activity",
      description: "See what has changed across your workspace.",
      steps: [
        "Open Activity from the sidebar.",
        "Review recent project, task, and collaboration actions.",
        "Use the activity history to understand what changed and when.",
        "Use pagination to move through older activity.",
      ],
    },
    {
      id: "comments",
      icon: <MessageSquare size={19} />,
      title: "Comments",
      description: "Discuss a task without leaving the task page.",
      steps: [
        "Open a task.",
        "Scroll to the Comments section.",
        "Write your message and submit it.",
        "Edit your own comment if you need to correct it.",
        "Delete your own comment when it is no longer needed.",
      ],
      tip: "Use comments for context, decisions, questions, and updates related to the task.",
    },
    {
      id: "notifications",
      icon: <Bell size={19} />,
      title: "Notifications",
      description: "Keep track of important updates and collaboration events.",
      steps: [
        "Open Notifications from the sidebar or navbar.",
        "Review your notifications.",
        "Use the Unread Only filter to focus on new notifications.",
        "Open or mark a notification as read.",
        "Use Mark All as Read when you have reviewed everything.",
        "Delete notifications you no longer need.",
      ],
    },
    {
      id: "settings",
      icon: <Settings size={19} />,
      title: "Settings",
      description: "Manage your profile and account security.",
      steps: [
        "Open Settings from the sidebar or your profile menu.",
        "Update your name or profile information.",
        "Choose a profile picture and upload it.",
        "Change your password from the security section.",
        "Save each change when finished.",
      ],
    },
    {
      id: "ai",
      icon: <Sparkles size={19} />,
      title: "AI Assistant",
      description: "Use AI to speed up common project-management tasks.",
      steps: [
        "Open AI Assistant from the sidebar.",
        "Select the project you want to work with.",
        "Choose an AI tool from the tools list.",
        "Provide the information requested by that tool.",
        "Generate the result and review it before using it in your project.",
      ],
      aiTools: [
        {
          title: "Generate Task",
          text: "Enter a requirement and AI creates a structured task with a title, description, priority, status, and suggested tags.",
        },
        {
          title: "Generate Task Description",
          text: "Enter a task title and optional context to get a clear, actionable task description.",
        },
        {
          title: "Summarize Project",
          text: "Select a project and get a concise summary of progress, completed work, pending work, risks, and recommended next steps.",
        },
        {
          title: "Meeting Notes → Tasks",
          text: "Paste meeting notes and AI identifies actionable tasks. It does not invent people who were not mentioned.",
        },
        {
          title: "Project Assistant",
          text: "Ask questions about the selected project. The assistant answers using the project's available information.",
        },
      ],
      tip: "AI suggestions should be reviewed before you add them to your team's actual workflow.",
    },
  ];

  return (
    <div className="min-h-full bg-[#F4F6F2]">
      <div className="border-b border-[#D6DDD8] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#8A2638] text-white">
                <HelpCircle size={23} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8A2638]">
                  TaskFlow Guide
                </p>

                <h1 className="mt-1 text-2xl font-semibold text-[#18211D] sm:text-3xl">
                  How to use TaskFlow
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68746E]">
                  A simple guide to help you understand the main features and
                  manage your team's work from start to finish.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="inline-flex h-10 items-center justify-center gap-2 border border-[#D6DDD8] bg-white px-4 text-sm font-medium text-[#18211D] transition hover:border-[#BFD8C7] hover:bg-[#F7F9F7]"
            >
              Back to Dashboard
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="border border-[#E1E5E2] bg-white">
          <div className="border-b border-[#E7EBE8] bg-[#F8ECEB] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#8A2638] text-white">
                <Bot size={18} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[#18211D]">
                  Quick start
                </h2>

                <p className="mt-1 text-sm leading-6 text-[#68746E]">
                  If you are using TaskFlow for the first time, follow this
                  basic workflow.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-px bg-[#E7EBE8] sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "01",
                "Create an account",
                "Sign up with your name, email, and password to get started.",
              ],
              [
                "02",
                "Sign in",
                "Log in to your TaskFlow account and open your Dashboard.",
              ],
              [
                "03",
                "Create a project",
                "Start by creating the project your team will work on.",
              ],
              [
                "04",
                "Add tasks",
                "Break the project into clear, manageable tasks.",
              ],
              [
                "05",
                "Assign and track",
                "Assign work and update status as tasks progress.",
              ],
              [
                "06",
                "Collaborate",
                "Use comments, attachments, activity, and notifications to stay aligned.",
              ],
            ].map(([number, title, text]) => (
              <div key={number} className="bg-white p-5">
                <span className="text-xs font-bold tracking-[0.12em] text-[#8A2638]">
                  {number}
                </span>

                <h3 className="mt-3 text-sm font-semibold text-[#18211D]">
                  {title}
                </h3>

                <p className="mt-1.5 text-xs leading-5 text-[#68746E]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 border border-[#E1E5E2] bg-white p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F8ECEB] text-[#8A2638]">
              <ListChecks size={18} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-[#18211D]">Features</h2>

              <p className="mt-1 text-sm text-[#68746E]">
                Jump directly to the feature you want to learn.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() =>
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex items-center gap-3 border border-[#E1E5E2] bg-[#FAFBFA] px-4 py-3 text-left transition hover:border-[#C9D9CF] hover:bg-[#F7F9F7]"
              >
                <span className="text-[#8A2638]">{section.icon}</span>
                <span className="text-sm font-medium text-[#18211D]">
                  {section.title}
                </span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-8 space-y-5">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-6 border border-[#E1E5E2] bg-white"
            >
              <div className="border-b border-[#E7EBE8] p-5 sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8ECEB] text-[#8A2638]">
                    {section.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A2638]">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <h2 className="text-lg font-semibold text-[#18211D]">
                        {section.title}
                      </h2>
                    </div>

                    <p className="mt-1 text-sm leading-6 text-[#68746E]">
                      {section.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#89938E]">
                  How to use it
                </h3>

                <ol className="mt-4 space-y-3">
                  {section.steps.map((step, stepIndex) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F8ECEB] text-[11px] font-semibold text-[#8A2638]">
                        {stepIndex + 1}
                      </span>

                      <p className="pt-0.5 text-sm leading-6 text-[#68746E]">
                        {step}
                      </p>
                    </li>
                  ))}
                </ol>

                {section.aiTools && (
                  <div className="mt-6 border border-[#D6DDD8] bg-[#F7F9F7]">
                    <div className="border-b border-[#DDE3DF] px-4 py-3">
                      <h3 className="text-sm font-semibold text-[#18211D]">
                        AI tools explained
                      </h3>
                    </div>

                    <div className="divide-y divide-[#E1E5E2]">
                      {section.aiTools.map((tool) => (
                        <div key={tool.title} className="p-4">
                          <p className="text-sm font-semibold text-[#18211D]">
                            {tool.title}
                          </p>

                          <p className="mt-1 text-sm leading-6 text-[#68746E]">
                            {tool.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {section.tip && (
                  <div className="mt-6 border-l-2 border-[#8A2638] bg-[#F8ECEB] px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8A2638]">
                      Tip
                    </p>

                    <p className="mt-1 text-sm leading-6 text-[#68746E]">
                      {section.tip}
                    </p>
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 border border-[#8A2638] bg-[#18211D] p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#8A2638] text-white">
              <UserRound size={19} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                A simple way to work in TaskFlow
              </h2>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#B9C3BE]">
                Create a project, break the work into tasks, assign those tasks,
                keep progress updated, and use comments, attachments,
                notifications, and AI tools when they help your team work
                faster.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Guide;
