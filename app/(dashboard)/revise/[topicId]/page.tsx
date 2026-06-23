import { redirect } from "next/navigation";

export default function ReviseTopicPage({ params }: { params: { topicId: string } }) {
  redirect(`/learn/${params.topicId}`);
}
