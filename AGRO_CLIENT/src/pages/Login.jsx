import LoginForm from "../features/auth/LoginForm"
import Logo from "../components/Logo"

const Login = () => {
    return (
        <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#09110a]">

            {/* Ambient glow effects */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-green-900/20 rounded-full blur-[120px]" />
                <div className="absolute -bottom-40 -right-20 w-[400px] h-[400px] bg-green-950/25 rounded-full blur-[100px]" />
            </div>

            {/* Left side: Logo */}
            <div className="hidden md:flex w-[35%] flex-col items-center justify-center border-r border-white/5 select-none relative z-10 gap-6 px-10">
                <Logo variant="large" />
                <p className="text-white/40 text-sm font-poppins text-center leading-relaxed px-4">
                    La plataforma de comercio agrícola local de El Salvador
                </p>
            </div>

            {/* Right side: Form */}
            <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto py-8 px-4 relative z-10">
                {/* Mobile logo */}
                <div className="md:hidden mb-8">
                    <Logo variant="navbar" />
                </div>

                <div className="w-full max-w-md">
                    <div className="mb-8 text-center md:text-left">
                        <h1 className="text-white font-black font-poppins text-3xl tracking-tight">Bienvenido</h1>
                        <p className="text-white/50 font-poppins text-sm mt-1">Ingresa tus credenciales para continuar</p>
                    </div>
                    <LoginForm />
                </div>
            </div>
        </div>
    )
}

export default Login