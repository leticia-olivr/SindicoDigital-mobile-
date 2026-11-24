export function errorMiddleware(error, req, res, next) {
  console.error('=== ERRO NA API ===');
  console.error(error);

  const statusCode = error.statusCode || error.status || 500;
  const message = statusCode >= 500
    ? 'Erro interno do servidor'
    : error.message;

  res.status(statusCode).json({
    status: 'error',
    message
  });
}