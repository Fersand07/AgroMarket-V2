import RegisterForm from "../features/auth/RegisterForm"
import bgImage from "../assets/bg-forms1.svg"
import Logo from "../assets/AGROMARKET.svg"

const Register = () => {
    return (
        <div className="flex flex-row h-screen" style={{backgroundImage: `url(${bgImage})`}}>
            <div className="w-2xl bg-altBgColor/20 flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-altBgColor rounded-full">
                    <img  src={Logo} />
                </div>
            </div>
            <div className="bg-primaryColor w-screen flex flex-col items-center justify-center gap-8">
                <h1 className="text-white font-bold font-poppins text-3xl">Registrate</h1>
                <RegisterForm/>
            </div>
        </div>
    )
}

export default Register