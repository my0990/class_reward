import { useRouter } from "next/navigation";
import CreateUser from "./createUser";
import { useState, useCallback, useEffect } from "react";
import {signIn} from "next-auth/react";

export const useValidateForm = ({
    initialForm ,
    initialError,
    initialIsTouched,
    validate,
    type
  }) => {
    // const { initialForm, initialError, initialIsTouched, validate, type } = props;
    const router = useRouter();
    const [form, setForm] = useState(initialForm);
    const [errors, setErrors] = useState(initialError);
    const [isTouched, setTouched] = useState(initialIsTouched);
    
    const changeHandler = (e) => {
      let { value, name } = e.currentTarget;
      setForm({
        ...form,
        [name]: value
      });
      console.log(form)
    };
  
    const blurHandler = (e) => {
      let { name } = e.currentTarget;
      setTouched({
        ...isTouched,
        [name]: true,
      })
    }
  
    const submitHandler = useCallback(
      async (e) => {
        e.preventDefault();
        const errors = validate(form);
        setErrors(errors);
        console.log(errors);
        if (Object.values(errors).some(v => v)) return;
        switch (type) {
          case 'logIn': // 로그인 로직, 로그인 시에도 이 hook 을 사용한다.

            const logInResponse = await signIn("credentials", {
              id: form.id,
              password: form.pwd,
              redirect: false,
              // callbackUrl: "/directory/market",
              // callbackUrl: "/directory/market"
            });
            if(logInResponse.status!== 200){
              setErrors({...errors, 'pwdCheck': '아이디와 비밀번호를 확인해주세요'})
            } else {
              router.replace('/directory/dashboard')
            }
            break;
          case 'register': // 회원가입 로직
            console.log('form')
            console.log('form')
            console.log('form')
            console.log('form')
            console.log('form')
            console.log(form)
            const registerResponse = await CreateUser(
              form.name,
              form.id,
              form.pwd,
              form.admin,
              form.teacher,
              form.nickname,
              form.gender
            );
  
            if (registerResponse) {
              alert('회원가입이 완료되었습니다.')
              router.push('/')
            }
            break;
        }
      }, [form]
    );

    // 입력값에 따라 검증 함수를 실행하는 함수
    // const runValidator = useCallback(() => validate(form), [form]);
  
    // useEffect(() => {
    //   const errors = runValidator();
    //   setErrors(errors)
    // }, [runValidator]);
  
    const getFieldProps = (name) => {
      // @ts-ignore
      const value = form[name];
  
      return {
        value,
        blurHandler,
        changeHandler,
      }
    }
  
    return {
      form,
      errors,
      isTouched,
      submitHandler,
      getFieldProps
    }
  }