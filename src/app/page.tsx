import LogSheetForm from "./components/LogSheetForm";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows items-center justify-items-center min-h-[100svh] w-full max-w-[430px] mx-auto">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <LogSheetForm />
      </main>
    </div>
  );
}
