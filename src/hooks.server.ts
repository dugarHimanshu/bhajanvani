import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Example: attach a simple request-local state or auth info here in the future
  // const user = await getUserFromRequest(event.request);
  // event.locals.user = user;

  const response = await resolve(event);
  return response;
};

// You can export other hooks (handleFetch, handleError) as needed later.