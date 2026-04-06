import type { HTMLAttributes } from "react";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[linear-gradient(110deg,rgba(226,232,240,0.9),rgba(241,245,249,1),rgba(226,232,240,0.9))] bg-[length:200%_100%] ${className}`}
      {...props}
    />
  );
}
