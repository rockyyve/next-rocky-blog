import { CMS_NAME } from "@/lib/constants";
import { CreatePostLink } from "./create-post-link";

export function Intro() {
  return (
    <section className="flex-col md:flex-row flex items-center md:justify-between mt-16 mb-16 md:mb-12">
      <h1 className="text-5xl md:text-8xl font-bold tracking-tighter leading-tight md:pr-8">
        Rocky's Blog
      </h1>
      <div className="flex flex-col items-center md:items-end space-y-4">
       
        <div className="md:pl-8">
          <CreatePostLink />
        </div>
      </div>
    </section>
  );
}
