
export function localLoad<Type>(key: string): Type | undefined {
    return localLoadDefault(key, undefined);
}

export function localLoadDefault<Type>(key: string, fallback: Type): Type {
    const saved = globalThis.localStorage.getItem(key)
    if (saved) {
        return JSON.parse(saved) as Type;
    }
    return fallback;
}

export function localSave<Type>(key: string, data: Type): void {
    globalThis.localStorage.setItem(key, JSON.stringify(data));
}
