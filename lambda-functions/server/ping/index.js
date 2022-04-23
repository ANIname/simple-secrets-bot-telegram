exports.handler = async () => ({
  headers: {
    'Content-Type': 'application/json',
  },

  statusCode: 200,
  body:       JSON.stringify({ message: 'pong' }),
});
