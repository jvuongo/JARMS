import { render } from '@testing-library/jest-dom';
import Social from '../pages/social/index';
import Friends from '@/components/social/Friends';
import Invites from '@/components/social/Invites';
import FindFriends from '@/components/social/FindFriends';

it('Renders social page unchanged', () => {
	const { container } = render(<Social />);
	expect(container).toMatchSnapshot();
});

it('Renders friends properly', () => {

	// create a mock data object with a bunch of friends
	const friendMockData = {
		friends: [
			{
				_id: '1',
				firstName: 'Tom',
				lastName: 'Cruise',
				age: '56',
				email: 'tom@mail.com',
				bio: 'Im the best',
			},
			{
				_id: '2',
				firstName: 'Chris',
				lastName: 'Tucker',
				age: '50',
				email: 'chris@mail.com',
				bio: 'Doing well',
			},
			{
				_id: '3',
				firstName: 'Kevin',
				lastName: 'Conroy',
				age: '66',
				email: 'kevin@mail.com',
				bio: 'Unprofessional professional',
			},
		],
	};


	const { container } = render(<Friends loading={false}/>);

	// Check for each friend exists
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id));
	});

	// Check that each friend is displayed properly
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id + '-firstName'));
		expect(container).toContainElement(document.getElementById(friend._id + '-bio'));
	});

	// Check that each friend has a view button
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id + '-view'));
	});

});

it('Renders invites properly', () => {
	// create a mock data object with a bunch of events in the future
	const inviteMockData = {
		invites: [
			{
				_id: '1',
				firstName: 'Ricky',
				lastName: 'Gian',
			},
			{
				_id: '2',
				firstName: 'Jack',
				lastName: 'Vuong',
			},
			{
				_id: '3',
				firstName: 'Andrew',
				lastName: 'Chung',
			},
		],
	};

	const { container } = render(<Invites invites={inviteMockData} loading={false}/>);

	// check that each invite exists
	inviteMockData.invites.forEach(invite => {
		expect(container).toContainElement(document.getElementById(invite._id));
	});

	// check that each invite is displaying properly
	inviteMockData.invites.forEach(invite => {
		expect(container).toContainElement(document.getElementById(invite._id + '-firstName'));
		expect(container).toContainElement(document.getElementById(invite._id + '-lastName'));
	});

	// check that each invite has a accept button
	inviteMockData.invites.forEach(invite => {
		expect(container).toContainElement(document.getElementById(invite._id + '-accept'));
	});

	// check that decline button for each invite has a click function
	inviteMockData.invites.forEach(invite => {
		document.getElementById(invite._id + '-decline').click();
	});
});


it('Renders friends recommended properly', () => {
	// create a mock data object with a bunch of events in the future
	const friendMockData = {
		friends: [
			{
				_id: '1',
				firstName: 'Ricky',
				lastName: 'Gian',
			},
			{
				_id: '2',
				firstName: 'Jack',
				lastName: 'Vuong',
			},
			{
				_id: '3',
				firstName: 'Andrew',
				lastName: 'Chung',
			},
		],
	};

	const { container } = render(<FindFriends friends={friendMockData} loading={false}/>);

	// check that each friend exists
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id));
	});

	// check that each friend is displaying properly
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id + '-firstName'));
		expect(container).toContainElement(document.getElementById(friend._id + '-lastName'));
	});

	// check that each friend has a view button
	friendMockData.friends.forEach(friend => {
		expect(container).toContainElement(document.getElementById(friend._id + '-view'));
	});

});