import { render } from '@testing-library/jest-dom';
import { SignInForm, Notification, SignUpForm, Submit } from '@/components/signIn/';

it('Renders sign up form', () => {
	const { container } = render(<SignUpModal />);
	
	// expect container to contain a modal
	expect(container).toContainElement(document.getElementById('signup-modal'));

	// expect sign up form to contain data fields
  
  // First name field
  expect(container).toContainElement(document.getElementById('signup-modal-firstname'));
  // Last name field
  expect(container).toContainElement(document.getElementById('signup-modal-lastname'));
  // email field
  expect(container).toContainElement(document.getElementById('signup-modal-email'));
  // password field
  expect(container).toContainElement(document.getElementById('signup-modal-password'));
  // confirm password field
  expect(container).toContainElement(document.getElementById('signup-modal-confirmPassword'));
	
	// Input for the sign up fields
	document.getElementById('signup-modal-firstname').value = 'Alvin';
  document.getElementById('signup-modal-lastname').value = 'Demi';
  document.getElementById('signup-modal-email').value = 'ad@mail.com';
  document.getElementById('signup-modal-password').value = 'password123';
  document.getElementById('signup-modal-confirmPassword').value = 'password123';

	// check that input contains text
	expect(document.getElementById('signup-modal-firstname').value).toBe('Alvin');
  expect(document.getElementById('signup-modal-lastname').value).toBe('Demi');
  expect(document.getElementById('signup-modal-email').value).toBe('ad@mail.com');
  expect(document.getElementById('signup-modal-password').value).toBe('password123');
  expect(document.getElementById('signup-modal-confirmPassword').value).toBe('password123');

});

it('Renders sign in form', () => {
	const { container } = render(<SignInModal />);
	
	// expect container to contain a modal
	expect(container).toContainElement(document.getElementById('signin-modal'));
  
  // email field
  expect(container).toContainElement(document.getElementById('signin-modal-email'));
  // password field
  expect(container).toContainElement(document.getElementById('signin-modal-password'));

	
	// Input for the sign up fields
  document.getElementById('signup-modal-email').value = 'ad@mail.com';
  document.getElementById('signup-modal-password').value = 'password123';

	// check that input contains text
  expect(document.getElementById('signup-modal-email').value).toBe('ad@mail.com');
  expect(document.getElementById('signup-modal-password').value).toBe('password123');

});

it('Renders reset password form', () => {
	const { container } = render(<resetPasswordModal />);
	
	// expect container to contain a modal
	expect(container).toContainElement(document.getElementById('reset-modal'));
  

  // email field
  expect(container).toContainElement(document.getElementById('signin-modal-email'));

	
	// Input for the sign up fields
  document.getElementById('signup-modal-email').value = 'ad@mail.com';

	// check that input contains text
  expect(document.getElementById('signup-modal-email').value).toBe('ad@mail.com');

});


