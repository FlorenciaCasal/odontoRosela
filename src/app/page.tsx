

export default function Home() {
  return (
    <main className="min-h-screen bg-app flex items-center justify-center px-4">
      <div className="card max-w-md p-6 text-center space-y-4">
        <h1 className="text-lg font-semibold text-strong">
          Este dispositivo no está enrolado.
        </h1>
        <p className="text-sm text-muted">
          Abrí la app desde el evento del calendario.
        </p>
      </div>
    </main>
  );
}
