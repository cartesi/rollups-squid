import { MockedObject, vi } from 'vitest';

export const mockModelImplementation = <T>(object: T) => {
    const Mock = vi.mocked(object) as MockedObject<typeof object>;
    // @ts-ignore
    Mock.mockImplementation((args) => ({ ...args } as object));
    return Mock;
};
