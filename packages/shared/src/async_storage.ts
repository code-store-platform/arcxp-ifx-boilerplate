import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Used to store data across async calls
 *
 * when you call .run() it will merge the data with the existing data
 * and then run the function within the context
 *
 * You can access the context data using ctx.get()
 *
 */
export class AsyncContext<T = any> {
	private store: AsyncLocalStorage<Partial<T>> = new AsyncLocalStorage();

	get(): Partial<T> | undefined {
		return this.store.getStore();
	}

	run<R extends Partial<T>, Fn extends () => any>(data: R, fn: Fn): ReturnType<Fn> {
		return this.store.run(
			{
				...this.get(),
				...data,
			},
			fn,
		);
	}
}

export const ctx = new AsyncContext<{ id: string; eventName: string; handlerName: string }>();
