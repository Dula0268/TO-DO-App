const { setupServer } = require('msw/node');
const { rest } = require('msw');

const handlers = [
  rest.get('/api/todos', (req, res, ctx) => {
    return res(ctx.json([{ id: 1, title: 'Existing Todo', completed: false }]));
  }),
  rest.post('/api/todos', async (req, res, ctx) => {
    const body = await req.json();
    return res(ctx.json({ id: 2, title: body.title, completed: false }));
  }),
];

const server = setupServer(...handlers);

module.exports = { server, rest };
