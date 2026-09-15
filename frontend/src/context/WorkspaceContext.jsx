import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const WorkspaceContext = createContext(null);

const CURRENT_WORKSPACE_KEY = "taskflow_current_workspace";

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/workspaces");

      const workspaceData = response.data?.data;

      const workspaceList = Array.isArray(workspaceData)
        ? workspaceData
        : workspaceData?.workspaces || [];

      setWorkspaces(workspaceList);

      const savedWorkspaceId = localStorage.getItem(CURRENT_WORKSPACE_KEY);

      const savedWorkspace = workspaceList.find(
        (workspace) => workspace._id === savedWorkspaceId,
      );

      if (savedWorkspace) {
        setCurrentWorkspace(savedWorkspace);
        return;
      }

      if (workspaceList.length > 0) {
        const firstWorkspace = workspaceList[0];

        setCurrentWorkspace(firstWorkspace);

        localStorage.setItem(CURRENT_WORKSPACE_KEY, firstWorkspace._id);

        return;
      }

      setCurrentWorkspace(null);
      localStorage.removeItem(CURRENT_WORKSPACE_KEY);
    } catch (error) {

      setWorkspaces([]);
      setCurrentWorkspace(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const selectWorkspace = useCallback((workspace) => {
    if (!workspace?._id) {
      return;
    }

    setCurrentWorkspace(workspace);

    localStorage.setItem(CURRENT_WORKSPACE_KEY, workspace._id);
  }, []);

  const createWorkspace = async ({ name, description = "" }) => {
    const response = await api.post("/workspaces", {
      name,
      description,
    });

    const newWorkspace = response.data?.data;

    if (!newWorkspace?._id) {
      throw new Error("Invalid workspace response");
    }

    setWorkspaces((previous) => [newWorkspace, ...previous]);

    setCurrentWorkspace(newWorkspace);

    localStorage.setItem(CURRENT_WORKSPACE_KEY, newWorkspace._id);

    return newWorkspace;
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        selectWorkspace,
        createWorkspace,
        refreshWorkspaces: fetchWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
};

export default WorkspaceContext;
