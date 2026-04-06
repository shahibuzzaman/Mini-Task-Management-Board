"use client";

import type { AuthViewer } from "@/features/auth/types/viewer";
import type { BoardSummary } from "@/features/boards/types/board";
import { TaskFormModal } from "@/components/board/task-form-modal";
import { TaskBoard } from "@/components/board/task-board";
import { useTaskBoardController } from "@/features/tasks/hooks/use-task-board-controller";

type TaskBoardShellProps = {
  board: BoardSummary;
  viewer: AuthViewer;
};

export function TaskBoardShell({ board, viewer }: TaskBoardShellProps) {
  const controller = useTaskBoardController({ board, viewer });

  return (
    <>
      <TaskBoard
        board={controller.board}
        viewer={controller.viewer}
        tasks={controller.tasks}
        isLoading={controller.isBoardLoading}
        errorMessage={controller.boardErrorMessage}
      />
      <TaskFormModal
        key={`${controller.editingTask?.id ?? "create"}-${controller.isTaskFormOpen ? "open" : "closed"}`}
        mode={controller.editingTask ? "edit" : "create"}
        task={controller.editingTask}
        initialStatus={controller.createTaskStatus}
        isOpen={controller.isTaskFormOpen}
        boardId={board.id}
        members={controller.members}
        isPending={controller.isTaskMutationPending}
        errorMessage={controller.errorMessage}
        onClose={controller.closeTaskForm}
        onSubmit={controller.handleSubmit}
      />
    </>
  );
}
