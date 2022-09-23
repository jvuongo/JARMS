import * as React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Form, Input, Button, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";


const Window = styled.div`
  height: 55vh;
  width: 30vw;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  background: #F9F4F5;
`
const Nav = styled.div`
  border-radius: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  height: 44px;
`
const Ul = styled.ul`
  list-style-none;
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 18px;
  display: flex;
  width: 100%;
`
const Li = styled.li`
font-weight: bold;
  border-radius: 5px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  width: 100%;
  padding: 25px 15px;
  position: relative;
  margin: 10px 20px;
  cursor: pointer;
  height: 24px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  flex: 1;
  min-width: 0;
  background: #F9F4F5;
  position: relative;
  user-select: none;

  &:hover {

  }
`

const FormBox = styled.div`
  display: flex;
  flex-direction: block;
  justify-content: center;
  padding-top: 50px;
  width: 100%;
  height: 100%;
`

const Underline = styled(motion.div)`
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 1px;
  background: white;
`


const MultiForm = () => {

  /*
    When state is true, signIn is displayed.
    Else it is SignUp.
  */
    const [signIn, setSignIn] = useState(true)

  return(
    <Window>
      <Nav>
        <Ul>
          <Li key='signIn' style={signIn ? {textDecoration: 'underline', borderRadius: '10px'} : {}} onClick={() => setSignIn(true)}>
            <span>LOGIN </span>
          </Li>
          <Li key='signUp' style={signIn ? {} : {textDecoration: 'underline', borderRadius: '10px'}} onClick={() => setSignIn(false)}>
          <span>SIGNUP </span>
          </Li>
        </Ul>
      </Nav>
      <FormBox>
        {signIn ? 
            (<SignInForm></SignInForm>) : (<SignUpForm></SignUpForm>)}
        </FormBox>
    </Window>
  );
}

export default MultiForm;
