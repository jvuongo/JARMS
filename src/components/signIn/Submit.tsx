import { Form, Input, Button, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import ModalBox from './Modal';


function submit(payload, setState){
  const router = useRouter();

  const requestOptions = {
    method: 'POST',
    headers: { 'Content-Type' : 'application/json'},
    body: JSON.stringify(payload)
  };

  // Sending payload to endpoint
  fetch('http://localhost:2102/login', requestOptions)
  .then(response => response.json())
  .then((data) => {

    // Check if 403 forbidden
    if (data === '403' || data[0].code === 'too_small'){
      setState(true);
    }
    else{
       // Need to tokenise and store as cookie

      // Redirect to homepage
      router.push('/');

      // Need to change user name in header

    }
  });
}

export default submit;