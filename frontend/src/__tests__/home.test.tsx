import { render } from '@testing-library/jest-dom';
import CreateEvent from '../pages/host/create';
import Host from '../pages/host/index';
import Past from '../pages/host/past';
import BroadcastModal from '@/components/host/BroadcastModal';
import PastEventsComponent from '@/components/host/PastEventsComponent';
import UpcomingEventsComponent from	'@/components/host/UpcomingEventsComponent';

it('Renders home page unchanged', () => {
	const { container } = render(<Host />);
	expect(container).toMatchSnapshot();
});

it('Renders past page unchanged', () => {
	const { container } = render(<Past />);
	expect(container).toMatchSnapshot();
});


it('Renders create page unchanged', () => {
	const { container } = render(<CreateEvent />);
	expect(container).toMatchSnapshot();
});

it('Renders proper broadcast modal', () => {
	const { container } = render(<BroadcastModal />);
	
	// expect container to contain a modal
	expect(container).toContainElement(document.getElementById('broadcast-modal'));

	// expect modal to contain a close button
	expect(container).toContainElement(document.getElementById('broadcast-modal-close'));

	// check that the close button has functionality
	document.getElementById('broadcast-modal-close').click();
	expect(document.getElementById('broadcast-modal')).toBeNull();

	// expect modal to contain a broadcast button 
	expect(container).toContainElement(document.getElementById('broadcast-modal-broadcast'));
	
	// check that broadcast button has functionality
	document.getElementById('broadcast-modal-broadcast').click();
	expect(document.getElementById('broadcast-modal')).toBeNull();

	// expect modal to contain a text input
	expect(container).toContainElement(document.getElementById('broadcast-modal-text'));
	
	// write something in input
	document.getElementById('broadcast-modal-text').value = 'test';

	// check that input contains text
	expect(document.getElementById('broadcast-modal-text').value).toBe('test');
});

it('Renders past events  properly', () => {

	// create a mock data object with a bunch of events in the past
	const mockData = {
		events: [
			{
				_id: '1',
				title: 'Event 1',
				startDate: '2020-01-01',
				location: 'Location 1',
			},
			{
				_id: '2',
				title: 'Event 2',
				startDate: '2020-01-02',
				location: 'Location 2',
			},
			{
				_id: '3',
				title: 'Event 3',
				startDate: '2020-01-03',
				location: 'Location 3',
			},
		],
	};


	const { container } = render(<PastEventsComponent loading={false}/>);

	// Check for each event that its in the past
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id));
	});

	// Check that each event is displayed properly
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id + '-title'));
		expect(container).toContainElement(document.getElementById(event._id + '-date'));
		expect(container).toContainElement(document.getElementById(event._id + '-location'));
	});

	// Check that each event has a view button
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id + '-view'));
	});

});

it('Renders upcoming events  properly', () => {
	// create a mock data object with a bunch of events in the future
	const mockData = {
		events: [
			{
				_id: '1',
				title: 'Event 1',
				startDate: '2023-01-01',
				location: 'Location 1',
			},
			{
				_id: '2',
				title: 'Event 2',
				startDate: '2023-01-02',
				location: 'Location 2',
			},
			{
				_id: '3',
				title: 'Event 3',
				startDate: '2023-01-03',
				location: 'Location 3',
			},
		],
	};

	const { container } = render(<UpcomingEventsComponent events={mockData} loading={false}/>);

	// check that each event is in the future
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id));
	});

	// check that each event is displayed properly
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id + '-title'));
		expect(container).toContainElement(document.getElementById(event._id + '-date'));
		expect(container).toContainElement(document.getElementById(event._id + '-location'));
	});

	// check that each event has a delete button
	mockData.events.forEach(event => {
		expect(container).toContainElement(document.getElementById(event._id + '-delete'));
	});

	// check that delete button for each event has a click function
	mockData.events.forEach(event => {
		document.getElementById(event._id + '-delete').click();
	});
});