import { addDocCol, arrayUnion, getDoc, updateDoc } from "../services/db.service";
import { db, serverTimestamp } from "../tools/firebase";

// TODO: Add type for data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createTask = (owner: string, projId: string, goalId: string, boardId: string, data: any, userId: string) => {
  const taskDocRef = db.collection(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}/tasks`).doc();
  const taskId = taskDocRef.id;

  const finalData = {
    ...data,
    id: taskId,
  };

  const dbData = {
    tasks: arrayUnion(finalData),
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  return Promise.all([
    addDocCol(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}/tasks`, {}, taskId),
    updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, dbData),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};

// TODO: Add type for data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const editTask = async (owner: string, projId: string, goalId: string, boardId: string, taskId: string, data: any, userId: string) => {
  const boardPath = `users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`;

  // TODO: Think about managing an object with the tasks instead of an array
  // This will fix editing the whole array of tasks
  const boardData = await getDoc(boardPath);
  const boardTasks = boardData.tasks;

  if (!boardTasks) return ({ success: false, message: "No tasks to edit" });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editingTaskIndex = boardTasks.findIndex((task: any) => task.id === taskId);
  if (editingTaskIndex < 0) return ({ success: false, message: "Task not found" });

  boardTasks[editingTaskIndex] = { ...boardTasks[editingTaskIndex], ...data };

  const dbData = {
    tasks: boardTasks,
    updatedAt: serverTimestamp(),
    updatedBy: userId,
  };

  return Promise.all([
    updateDoc(`users/${owner}/projects/${projId}/goals/${goalId}/boards/${boardId}`, dbData),
  ]).then((resp) => resp[0]).catch((error) => ({ success: false, message: error.message ?? error }));
};
