import puter from "@heyputer/puter.js";
import { getOrCreateHostingConfig, uploadImageToHosting } from "./puter.hosting";
import { isHostedUrl } from "../utils";
import { PUTER_WORKER_URL } from "./constants";

export const signIn = async () => await puter.auth.signIn();
export const signOut =  () => puter.auth.signOut();

export const getCurrentUser = async () => {
    try {
        return await puter.auth.getUser();
    }catch {
        return null;
    }
}

export const createProject = async ({ item, visibility = "private" }: CreateProjectParams): Promise<DesignItem | null| undefined> => {
    if(!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; Skip project save;");
        return null;
    }
    const projectId = item.id;
    const resolvedVisibility = visibility ?? "private";

    const hosting = await getOrCreateHostingConfig();

    const hostedSource = projectId
        ? await uploadImageToHosting({ hosting, url: item.sourceImage, projectId, label: "source" })
        : null;

    const hostedRender = projectId && item.renderedImage
        ? await uploadImageToHosting({ hosting, url: item.renderedImage, projectId, label: "rendered" })
        : null;

    const resolvedSource = hostedSource?.url || item.sourceImage || "";

    if (!resolvedSource) {
        console.warn("Failed to host source image, skipping save.");
        return null;
    }

    const resolvedRender = hostedRender?.url || item.renderedImage || null;

    const { sourcePath: _sourcePath, renderedPath: _renderedPath, publicPath: _publicPath, ...rest } = item;

    const payload: DesignItem = {
        ...rest,
        id: item.id,
        name: item.name,
        sourceImage: resolvedSource,
        renderedImage: resolvedRender ?? null,
        timestamp: item.timestamp || Date.now(),
        ownerId: item.ownerId ?? null,
        sharedBy: item.sharedBy ?? null,
        sharedAt: item.sharedAt ?? null,
        isPublic: resolvedVisibility === "public",
    };

    try {


        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/save`, {
            method: 'POST',headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ project: payload, visibility: resolvedVisibility }),
        });
       
        if(!response.ok) {  
             console.error("Failed to save project", await response.text());
             return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };

        return data.project ?? null;
    } catch (e) {
        console.log("Failed to save project", e);
        return null;
    }
};


export const getProjects = async (): Promise<DesignItem[]> => {
    if (!PUTER_WORKER_URL) {
        console.warn("Missing VITE_PUTER_WORKER_URL; Skip history fetch;");
        return [];
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/list`, {
            method: 'GET',
        });

        if (!response.ok) {
            console.error("Failed to fetch projects", await response.text());
            return [];
        }

        const data = (await response.json()) as { projects?: DesignItem[] | null };
        return Array.isArray(data.projects) ? data.projects : [];
    } catch (e) {
        console.error("Failed to fetch projects", e);
        return [];
    }
};

export const getProjectByID = async (id: string): Promise<DesignItem | null> => {
    if (!id || !PUTER_WORKER_URL) {
        return null;
    }

    try {
        const response = await puter.workers.exec(`${PUTER_WORKER_URL}/api/projects/get?id=${encodeURIComponent(id)}`, {
            method: 'GET',
        });

        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }

            console.error("Failed to fetch project", await response.text());
            return null;
        }

        const data = (await response.json()) as { project?: DesignItem | null };
        return data.project ?? null;
    } catch (e) {
        console.error("Failed to fetch project", e);
        return null;
    }
};


