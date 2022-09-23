import { notification } from 'antd';

const Notification = (notifType: String, type, errorObj?) => {

  const signUpFailMESSAGE = 'Create account failed';
  const signInMESSAGE = 'Sign in failed';
  const signUpSucessMESSAGE = 'Sign up success';
  const resetFailMESSAGE = 'Reset password failed'
  const resetSuccessMESSAGE = 'Reset password succcess'

  if(type === 'signIn'){
     /*
      Could be a single error code or an array of 
      error codes.
    */
    for (var key of Object.keys(errorObj)){
      return(
        notification[notifType]({
          message: signInMESSAGE,
          description: errorObj[key].message,
        }));
    }
  }
  else if(type === 'signedUp'){
    return(
      notification[notifType]({
        message: signUpSucessMESSAGE,
        description: 'Please check your email to verify your account!',
      }));
  }
  else if(type === 'resetLink'){
    return(
      notification[notifType]({
        message: 'Sent reset link success',
        description: 'Please check your email to reset your password!',
      }));
  }
  else if(type === 'resetPassword'){
      for (var key of Object.keys(errorObj)){
        return(
          notification[notifType]({
            message: resetFailMESSAGE,
            description: errorObj[key].message,
          }));
      }
  }
  else if(type === 'resetPasswordSuccess'){
    return(
      notification[notifType]({
        message: resetSuccessMESSAGE,
        description: 'Successfully resetted password',
      }));
  }

  else{
    for (var key of Object.keys(errorObj)){
      return(
        notification[notifType]({
          message: signUpFailMESSAGE,
          description: errorObj[key].message,
        }));
    }
  }
};

export default Notification;
