import TodoSkeleton from "../components/skeletons/TodoSkeleton";


export default function Loading() {
  return (
    <div className="p-8 space-y-4">
      <TodoSkeleton />
      <TodoSkeleton />
      <TodoSkeleton />
    </div>
  );
}
