const { app } = require('@azure/functions');

app.http('child-js', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        return { body: `DONE` };
    }
});
