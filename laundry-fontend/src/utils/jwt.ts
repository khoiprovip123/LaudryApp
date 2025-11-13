function base64UrlDecode(input: string): string {
	const pad = (s: string) => s + '==='.slice((s.length + 3) % 4);
	const b64 = pad(input.replace(/-/g, '+').replace(/_/g, '/'));
	return atob(b64);
}

export function getCompanyIdFromToken(token: string): string | null {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return null;
		const payloadJson = base64UrlDecode(parts[1]);
		const payload = JSON.parse(payloadJson);
		const companyId = payload['company_id'] as string | undefined;
		return companyId ?? null;
	} catch {
		return null;
	}
}

export function getIsSuperAdminFromToken(token: string): boolean {
	try {
		const parts = token.split('.');
		if (parts.length !== 3) return false;
		const payloadJson = base64UrlDecode(parts[1]);
		const payload = JSON.parse(payloadJson);
		const val = payload['is_super_admin'];
		if (typeof val === 'boolean') return val;
		if (typeof val === 'string') return val.toLowerCase() === 'true';
		// Fallback: nếu không có claim, suy luận theo company_id
		return !payload['company_id'];
	} catch {
		return false;
	}
}


