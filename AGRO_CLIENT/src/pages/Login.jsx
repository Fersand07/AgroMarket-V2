import LoginForm from "../features/auth/LoginForm"
import bgImage from "../assets/bg-forms1.svg"
import Logo from "../assets/AGROMARKET.svg"

const Login = () => {

    return (
        <div className="flex flex-row">
            <div className=" flex flex-col justify-center items-center gap-14 w-2xl login-container bg-primaryColor">
                <div className="w-48 h-48 bg-altBgColor rounded-full">
                    <img alt="Logo"  src={Logo} />
                </div>
                <LoginForm/>
            </div>
            <img  className="h-screen" src={bgImage} alt=""/>
        </div>
    )
}

export default Login