
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ArticlesLoading = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="bg-background-dark p-4 rounded-md border border-gray-800 animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-6" />
          </div>
          <Skeleton className="h-3 w-full mb-2" />
          <Skeleton className="h-3 w-5/6 mb-2" />
          <Skeleton className="h-3 w-4/6 mb-4" />
          <div className="flex justify-end">
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticlesLoading;
