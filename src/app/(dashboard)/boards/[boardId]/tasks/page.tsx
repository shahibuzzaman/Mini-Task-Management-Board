import { redirect } from "next/navigation";

type BoardTasksPageProps = {
  params: Promise<{
    boardId: string;
  }>;
};

export default async function BoardTasksPage({ params }: BoardTasksPageProps) {
  const { boardId } = await params;
  redirect(`/boards/${boardId}`);
}
