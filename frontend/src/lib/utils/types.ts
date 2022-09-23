export interface UserType {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	friends?: UserType[];
	bio?: string;
	avatar?: string;
	age?: number | string;
	interestedEventTypes?: string[];
	location?: string;
	gender?: string;
}

