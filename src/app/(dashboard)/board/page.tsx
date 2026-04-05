import { redirect } from "next/navigation";
import { getBoardPath, getBoardsPath } from "@/features/boards/lib/board-routes";

type BoardPageProps = {
  searchParams: Promise<{
    boardId?: string;
  }>;
};

export default async function BoardPage({ searchParams }: BoardPageProps) {
  const { boardId } = await searchParams;
  redirect(boardId ? getBoardPath(boardId) : getBoardsPath());
}
