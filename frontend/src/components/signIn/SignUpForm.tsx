import { Form, Input, Button, DatePicker} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import moment from 'moment';
import { useState, useEffect } from 'react';
import {DATEFORMAT} from '../../lib/utils/constants'
import { useRouter } from 'next/router';
import { useCookies } from 'react-cookie';
import Notification from './Notification';
import Title from 'antd/lib/typography/Title';

const SignUpForm = () => {

  const [cookies, setCookies] = useCookies();

  const { RangePicker } = DatePicker;

  const router = useRouter();

  const [email, setEmail] = useState('');

  const [firstName, setFirstName] = useState('');

  const [lastName, setLastName] = useState('');


  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Need to figure out the format or datatype for date
  // const [dateOfBirth, setDateOfBirth] = useState('');

  // function dateChange(dob) {
  //   setDateOfBirth(dob);
  //   console.log(dateOfBirth.toString());
  // }
  // function onChange(date, dateString) {
  //   console.log(date, dateString);
  // }

  var payload = {
    "firstName" : firstName,
    "lastName" : lastName,
    "email" : email,
    "password" : password,
    "confirmPassword" : confirmPassword
  }

  function submit(){

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json'},
      body: JSON.stringify(payload)
    };

    // Sending payload to endpoint
    // Trying to get success notification to pop up, I don't kow what is the response sent back for successful pending user
    fetch('http://localhost:2102/users', requestOptions)
    // Response is turned into a json, so please make sure the thing we are sending is in json form.
    .then(response => response.json())
    .then((data) => {
      // There is no error
      if(data[0] === undefined){
        // Store user object and store as cookie
        // middleware
        // store user object
        setCookies('userObj', data, {path: '/'} );
        // Look into encoding middleware
        Notification('success', 'signedUp');
        router.push('/login');
      }
      // If error array is longer then 1 loop through all

      // Check if 403 forbidden
      else {
        Notification('error', 'signUp', data);
      }
    });
  }

  return(
    <>

    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      style={{ width: "60%", marginRight: 0 }}
      size="large"

      // onFinish={onFinish}
    >
                                {/* <Title style={{fontFamily: 'lato', margin: '25px 0px'}} level={3}> Sign up </Title> */}

       <Form.Item
        name="firstName"
        rules={[{ required: true, message: 'Please enter your firstName.' }]}
        style={{ marginBottom: 10, marginTop: 25 }}

      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="First name" onChange={e => setFirstName(e.target.value)}/>
      </Form.Item>
      <Form.Item
        name="lastName"
        rules={[{ required: true, message: 'Please enter your lastName.' }]}
        style={{ marginBottom: 10 }}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Last name"  onChange={e => setLastName(e.target.value)}/>
      </Form.Item>
      <Form.Item
        name="Email"
        rules={[{ required: true, message: 'Please enter an email address.' }]}
        style={{ marginBottom: 10 }}

      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Email"  onChange={e => setEmail(e.target.value)}/>
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: 'Please enter a password!' }]}
        style={{ marginBottom: 10 }}

      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
          onChange={e => setPassword(e.target.value)}
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        rules={[{ required: true, message: 'Please confirm your password' }]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Confirm Password"
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </Form.Item>
      {/* <Form.Item
        label="Date of birth"
      >
        <DatePicker format={DATEFORMAT} onChange={onChange}/>
      </Form.Item> */}
      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button" block onClick={submit}>
          Create account
        </Button>
      </Form.Item>
    </Form>
    </>
  );
};

export default SignUpForm;