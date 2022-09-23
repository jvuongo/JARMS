import { render } from '@testing-library/jest-dom';
import MyTicket from '../pages/ticket/[tid]/index';
import PastTicketsComponent from '@/components/tickets/PastTicketsComponent';
import UpcomingTicketsComponent from '@/components/tickets/UpcomingTicketsComponent';

it('Renders ticket page unchanged', () => {
	const { container } = render(<MyTicket />);
	expect(container).toMatchSnapshot();
});

it('Renders proper ticket page', () => {
	const { container } = render(<MyTicket />);
	
	// create a mock data object with a bunch of tickets
	const ticketMockData = {
		tickets: [
			{
				event: '1',
        			uid: '1',
        			email: joe@mail.com,
        			eventName: 'NYE Party',
        			eventHost: 'Bob Smith',
        			eventDate: '31 December 2022',
			},
			{
				event: '2',
        			uid: '2',
        			email: bob@mail.com,
        			eventName: 'Study Session',
        			eventHost: 'Robert Hall',
        			eventDate: '25 April 2022',
			},
			{
				event: '3',
        			uid: '3',
        			email: connor@mail.com,
        			eventName: 'Bar Crawl',
        			eventHost: 'Trevor Lane',
        			eventDate: '15 May 2022',
			},
		],
	};
	
	// Check that each ticket exists
	ticketMockData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id));
	});
	
	// Check that each ticket is displayed properly
	ticketMockData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventName'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventHost'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventDate'));
	});

	// Check that each ticket has a cancel button
	ticketMockData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + 'cancel-ticket'));
	});

	// check that the cancel button has functionality
	document.getElementById('cancel-ticket').click();
	expect(document.getElementById('cancel-ticket')).toBeNull();

});

it('Renders past tickets  properly', () => {

	// create a mock data object with a bunch of tickets in the past
	const pastTicketData = {
		tickets: [
			{
				event: '1',
        			uid: '1',
        			email: andrew@mail.com,
        			eventName: 'Beach outing',
        			eventHost: 'Andrew Chung',
        			eventDate: '28 July 2021',
			},
			{
				event: '2',
        			uid: '2',
        			email: steven@mail.com,
        			eventName: 'Movie night',
        			eventHost: 'Steven Lam',
        			eventDate: '22 June 2021',
			},
			{
				event: '3',
        			uid: '3',
        			email: ricky@mail.com,
        			eventName: 'Footy game',
        			eventHost: 'Ricky Gian',
        			eventDate: '18 February 2021',
			},
		],
	};
	

	const { container } = render(<PastTicketsComponent loading={false}/>);

	// Check for each ticket that its in the past
	pastTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id));
	});

	// Check that each ticket is displayed properly
	pastTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventName'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventHost'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventDate'));
	});

	// Check that each ticket has a view button
	pastTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + '-view'));
	});

});

it('Renders upcoming tickets  properly', () => {
	// create a mock data object with a bunch of tickets in the future
	const upcomingTicketData = {
		tickets: [
			{
				event: '1',
        			uid: '1',
        			email: joe@mail.com,
        			eventName: 'NYE Party',
        			eventHost: 'Bob Smith',
        			eventDate: '31 December 2022',
			},
			{
				event: '2',
        			uid: '2',
        			email: bob@mail.com,
        			eventName: 'Study Session',
        			eventHost: 'Robert Hall',
        			eventDate: '25 April 2022',
			},
			{
				event: '3',
        			uid: '3',
        			email: connor@mail.com,
        			eventName: 'Bar Crawl',
        			eventHost: 'Trevor Lane',
        			eventDate: '15 May 2022',
			},
		],
	};

	const { container } = render(<UpcomingTicketsComponent tickets={upcomingTicketData} loading={false}/>);

	// check that each ticket is in the future
	upcomingTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id));
	});

	// check that each ticket is displayed properly
	upcomingTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventName'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventHost'));
		expect(container).toContainElement(document.getElementById(ticket._id + '-eventDate'));
	});

	// check that each ticket has a view button
	upcomingTicketData.tickets.forEach(ticket => {
		expect(container).toContainElement(document.getElementById(ticket._id + '-view'));
	});

	// check that view button for each ticket has a click function
	upcomingTicketData.tickets.forEach(ticket => {
		document.getElementById(ticket._id + '-view').click();
	});
});
