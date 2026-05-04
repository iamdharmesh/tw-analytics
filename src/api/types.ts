/** Raw shapes from Teamwork API (partial, defensive parsing). */

export interface TwProjectRaw {
	id: number | string;
	name: string;
}

export interface TwTimelogRaw {
	id: number | string;
	minutes: number;
	timeLogged?: string;
	dateLogged?: string;
	projectId?: number | string;
	taskId?: number | string;
	userId?: number | string;
}

export interface TwMeUser {
	id: number | string;
	firstName?: string;
	lastName?: string;
	email?: string;
	avatarURL?: string;
}

export interface TwV1EstimatedProject {
	id: string;
	name: string;
	totalEstimatedMins?: string;
	totalEstimatedHours?: string;
}

export interface TwV1EstimatedResponse {
	STATUS?: string;
	projects?: TwV1EstimatedProject[];
}
