import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

const ForgotPasswordPage = () => {
  const [email,setEmail] = useState("")
  const [isSubmitted,setIsSubmitted]=  useState("")
  const [error,setError]= useState("")

  const dispatch = useDispatch()
  const handleSubmit = (e)=>{

    
  }
  return <>ForgotPasswordPage</>;
};

export default ForgotPasswordPage;
