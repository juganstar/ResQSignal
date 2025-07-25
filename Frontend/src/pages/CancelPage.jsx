export default function CancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Pagamento cancelado</h1>
      <p className="text-lg text-gray-300 mb-6">
        O seu pagamento foi cancelado. Pode tentar novamente a qualquer momento.
      </p>
      <a href="/" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
        Voltar à página inicial
      </a>
    </div>
  );
}
