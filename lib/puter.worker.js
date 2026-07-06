const PROJECT_PREFIX = 'roomify_project_';

const jsonError = (status, message, extra = {}) => {
    return new Response(JSON.stringify({ error: message, ...extra }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    })
}

const getUserId = async (userPuter) => {
    try {
        const user = await userPuter.auth.getUser();
        return user?.uuid || null;
    } catch (e) {
        return null;
    }
}

router.get('/api/projects/list', async () => {

    try {
        const userPuter = user.puter;

        if (!userPuter) return jsonError(401, 'User not authenticated');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const entries = (await userPuter.kv.list(PROJECT_PREFIX, true)) || [];
        const projects = (await userPuter.kv.getAll(entries.map(entry => typeof entry === 'string' ? entry : entry?.key))) || [];

        for (const entry of entries) {
            const key = typeof entry === 'string' ? entry : entry?.key;
            if (typeof key === 'string' && key.startsWith(PROJECT_PREFIX)) {
                const value = await userPuter.kv.get(key);
                if (value !== null && value !== undefined) {
                    projects.push(value);
                }
            }
        }

        return { projects };
    } catch (e) {
        return jsonError(500, 'Failed to list projects', { message: e.message || 'Unknown error' });
    }
})

router.get('/api/projects/get', async ({ request }) => {
    try {
        const userPuter = user.puter;

        if (!userPuter) return jsonError(401, 'User not authenticated');

        const userId = await getUserId(userPuter);
        if (!userId) return jsonError(401, 'Authentication failed');

        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) return jsonError(400, 'Project id is required');

        const key = `${PROJECT_PREFIX}${id}`;
        const project = await userPuter.kv.get(key);

        if (project === null || project === undefined) return jsonError(404, 'Project not found');

        return { project };
    } catch (e) {
        return jsonError(500, 'Failed to get project', { message: e.message || 'Unknown error' });
    }
})

router.post('/api/projects/save', async ({ request }) => {
    try {
         const userPuter = user.puter;

         if(!userPuter) return jsonError(401, 'User not authenticated');

         const body = await request.json();
         const project = body?.project;

         if(!project?.id || !project?.sourceImage) return jsonError(400, 'Invalid project data');

          const payload = {
            ...project,
            updatedAt:  new Date().toISOString(),
          }

          const userId = await getUserId(userPuter);
          if(!userId) return jsonError(401, 'Authentication failed');

          const key = `${PROJECT_PREFIX}${project.id}`;
          await userPuter.kv.set(key, payload);

          return {saved: true, id: project.id, project: payload};
    } catch (e) {
        return jsonError(500, 'Failed to save project', { message: e.message || 'Unknown error' });
    }
})

