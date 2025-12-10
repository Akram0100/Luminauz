export function generateSlug(title: string, id?: number): string {
    const baseSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 50);
    return id ? `${baseSlug}-${id}` : baseSlug;
}
