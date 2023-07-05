import type { PropsWithChildren } from "react";
import Navbar from "./Navbar";

export default function Layout(props: PropsWithChildren) {
  return (
    <div>
      <Navbar />
      <main className="overflow-none flex h-screen justify-center">
        <div className="flex h-fit w-full flex-col border-x border-slate-400 md:max-w-2xl md:border-t-2">
          {props.children}
        </div>
      </main>
    </div>
  );
}
