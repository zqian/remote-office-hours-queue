import { ManageQueue, AttendingQueue, User, MyUser } from "../models";

const getCsrfToken = () => {
    return (document.querySelector("[name='csrfmiddlewaretoken']") as HTMLInputElement).value;
}

const getPostHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
    };
}

const getPatchHeaders = getPostHeaders;

const getDeleteHeaders = () => {
    return {
        'X-CSRFToken': getCsrfToken(),
    };
}

const handleErrors = async (resp: Response) => {
    if (resp.ok) return;
    if (resp.status === 400) {
        const json = await resp.json();
        const messages = ([] as string[][]).concat(...Object.values<string[]>(json));
        const formatted = messages.join("\n");
        throw new Error(formatted);
    }
    console.error(await resp.text());
    throw new Error(resp.statusText);
}

export const getUsers = async () => {
    const resp = await fetch("/api/users/", { method: "GET" });
    await handleErrors(resp);
    return await resp.json() as User[];
}

export const getQueues = async () => {
    const resp = await fetch("/api/queues/", { method: "GET" });
    await handleErrors(resp);
    return await resp.json() as ManageQueue[];
}

export const getQueue = async (id: number) => {
    const resp = await fetch(`/api/queues/${id}/`, { method: "GET" });
    await handleErrors(resp);
    return await resp.json() as ManageQueue | AttendingQueue;
}

export const createQueue = async (name: string) => {
    const resp = await fetch("/api/queues/", { 
        method: "POST",
        body: JSON.stringify({
            name: name,
            host_ids: [],  //Ideally, this wouldn't be required
        }),
        headers: getPostHeaders(),
    });
    await handleErrors(resp);
    return await resp.json() as ManageQueue;
}

export const deleteQueue = async (id: number) => {
    const resp = await fetch(`/api/queues/${id}/`, { 
        method: "DELETE",
        headers: getDeleteHeaders(),
    });
    await handleErrors(resp);
    return resp;
}

export const addMeeting = async (queue_id: number, user_id: number) => {
    const resp = await fetch("/api/meetings/", {
        method: "POST",
        body: JSON.stringify({
            queue: queue_id,
            attendee_ids: [user_id],
        }),
        headers: getPostHeaders(),
    });
    await handleErrors(resp);
    return resp;
}

export const removeMeeting = async (meeting_id: number) => {
    const resp = await fetch(`/api/meetings/${meeting_id}`, {
        method: "DELETE",
        headers: getDeleteHeaders(),
    });
    await handleErrors(resp);
    return resp;
}

export const addHost = async (queue_id: number, user_id: number) => {
    const resp = await fetch(`/api/queues/${queue_id}/hosts/${user_id}/`, {
        method: "POST",
        headers: getPostHeaders(),
    });
    await handleErrors(resp);
    return resp;
}

export const removeHost = async (queue_id: number, user_id: number) => {
    const resp = await fetch(`/api/queues/${queue_id}/hosts/${user_id}/`, {
        method: "DELETE",
        headers: getDeleteHeaders(),
    });
    await handleErrors(resp);
    return resp;
}

export const changeQueueName = async (queue_id: number, name: string) => {
    const resp = await fetch(`/api/queues/${queue_id}/`, {
        method: "PATCH",
        headers: getPatchHeaders(),
        body: JSON.stringify({
            name: name,
        }),
    });
    await handleErrors(resp);
    return await resp.json();
}

export const changeQueueDescription = async (queue_id: number, description: string) => {
    const resp = await fetch(`/api/queues/${queue_id}/`, {
        method: "PATCH",
        headers: getPatchHeaders(),
        body: JSON.stringify({
            description: description,
        }),
    });
    await handleErrors(resp);
    return await resp.json();
}

export const getMyUser = async (user_id: number) => {
    const resp = await fetch(`/api/users/${user_id}/`, { method: "GET" });
    await handleErrors(resp);
    return await resp.json() as MyUser;
}

export const searchQueue = async (term: string) => {
    const resp = await fetch(`/api/queues_search/?search=${term}`, { method: "GET" });
    await handleErrors(resp);
    return await resp.json() as AttendingQueue[];
}
